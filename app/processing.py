import cv2
import numpy as np
from typing import Tuple, Optional

def preprocess_image(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Convert image to grayscale and apply thresholding (Otsu).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Otsu thresholding: returns binary image
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return gray, thresh

def detect_edges(image: np.ndarray, low_threshold: int = 50, high_threshold: int = 150) -> np.ndarray:
    """
    Use Canny edge detection to find edges in image.
    """
    edges = cv2.Canny(image, low_threshold, high_threshold)
    return edges

def order_points(pts: np.ndarray) -> np.ndarray:
    """
    Order points in the order: top-left, top-right, bottom-right, bottom-left.
    """
    rect = np.zeros((4, 2), dtype="float32")
    pts = pts.reshape(4, 2)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def transform_perspective(image: np.ndarray, contour: np.ndarray) -> np.ndarray:
    """
    Given a quadrilateral contour, perform a perspective transform to rectify the notebook.
    Additionally, apply rotation correction if the notebook is not captured parallel.
    """
    rect = order_points(contour)
    (tl, tr, br, bl) = rect

    # Compute widths and heights for the new image:
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = int(max(widthA, widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = int(max(heightA, heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    
    # Calculate the angle of the top edge relative to horizontal
    angle = np.degrees(np.arctan2(tr[1] - tl[1], tr[0] - tl[0]))
    if abs(angle) > 1:  # Apply rotation only if the angle is significant
        center_pt = (maxWidth // 2, maxHeight // 2)
        R = cv2.getRotationMatrix2D(center_pt, angle, 1.0)
        warped = cv2.warpAffine(warped, R, (maxWidth, maxHeight))
    return warped

def calculate_center_and_angle(_unused: np.ndarray, contour: np.ndarray, camera_width: Optional[int] = None) -> Tuple[Tuple[int, int], float]:
    """
    Calculate the center from the provided contour's vertices.
    """
    pts = contour.reshape(4, 2)
    cx = int(np.mean(pts[:, 0]))
    cy = int(np.mean(pts[:, 1]))
    return (cx, cy), 0

def draw_bounding_box(image: np.ndarray, contour: np.ndarray) -> np.ndarray:
    """
    Draw the notebook contour as a bounding box on the image.
    Returns a copy of the image with the bounding box.
    """
    image_copy = image.copy()
    cv2.drawContours(image_copy, [contour], -1, (0, 255, 0), 2)
    return image_copy

def capture_image(camera_index: int = 0, capture_key: str = "c") -> np.ndarray:
    """
    Open a window with a live feed from the camera and let the user capture a frame
    by pressing the specified key.
    """
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Can not open camera")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        cv2.imshow("Camera Feed - Press '{}' to capture".format(capture_key), frame)
        key = cv2.waitKey(1)
        if key & 0xFF == ord(capture_key):
            captured_frame = frame.copy()
            break
        elif key & 0xFF == ord("q"):
            captured_frame = None
            break

    cap.release()
    cv2.destroyAllWindows()
    if captured_frame is None:
        raise RuntimeError("Frame capture aborted by user")
    return captured_frame

def show_debug_window(name: str, image: np.ndarray, wait: bool = False) -> None:
    """Helper function to show debug windows"""
    cv2.imshow(name, image)
    if wait:
        cv2.waitKey(0)

def segment_notebook(thresh: np.ndarray) -> Optional[np.ndarray]:
    """
    Segment the notebook using morphological operations and return a tight
    rotated bounding box (as a contour) based on the minAreaRect.
    """
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        if cv2.contourArea(largest) < 1000:
            return None
        rect = cv2.minAreaRect(largest)  # (center, (w, h), angle)
        box = cv2.boxPoints(rect)       # 4 corners of the rotated bounding box
        box = np.int0(box)
        return box.reshape((4, 1, 2))  # return in contour format
    return None

def process_notebook_image(image: np.ndarray, camera_width: Optional[int] = None, debug: bool = True) -> Tuple[np.ndarray, Tuple[int, int], float]:
    """
    Runs through the complete pipeline with optional debug visualization using threshold-based segmentation.
    """
    if debug:
        show_debug_window("1. Original Image", image)
    
    # Grayscale and threshold
    gray, thresh = preprocess_image(image)
    if debug:
        show_debug_window("2. Grayscale", gray)
        show_debug_window("3. Threshold", thresh)
    
    # Use threshold segmentation instead of edge-based contour detection
    contour = segment_notebook(thresh)
    if contour is None:
        raise RuntimeError("Notebook segmentation failed")
    
    if debug:
        contour_vis = draw_bounding_box(image.copy(), contour)
        show_debug_window("4. Segmented Contour", contour_vis)

    # Perspective transform using the segmented bounding box contour
    warped = transform_perspective(image, contour)
    if debug:
        show_debug_window("5. Warped Perspective", warped)
    
    # Calculate center using the rotated tight box contour
    center, angle = calculate_center_and_angle(warped, contour, camera_width)
    if debug:
        result = image.copy()
        cv2.drawContours(result, [contour], -1, (0, 255, 0), 2)
        cv2.circle(result, center, 10, (0, 0, 255), -1)
        cv2.putText(result, f"Center: {center}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        show_debug_window("6. Final Result", result, wait=True)

    return contour, warped, center, angle

if __name__ == "__main__":
    try:
        image = capture_image()
        contour, warped, center, angle = process_notebook_image(
            image, 
            camera_width=image.shape[1],
            debug=True  # Enable debug visualization
        )
        
        # Close all windows when done
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        
    except Exception as e:
        print("Error:", e)
