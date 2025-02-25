import cv2
import numpy as np
from typing import Tuple, Optional

def preprocess(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Improved preprocessing to detect white/light colored paper.
    """
    # Optionally apply a blur to reduce noise
    blurred = cv2.GaussianBlur(image, (5, 5), 0)
    
    # Convert to HSV color space
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)
    
    # Adjusted HSV range; you might need to tweak these values
    lower = np.array([0, 0, 150])
    upper = np.array([180, 60, 255])
    
    # Create mask for white/light regions
    mask = cv2.inRange(hsv, lower, upper)
    
    # Clean up the mask with morphological operations
    kernel = np.ones((3, 3), np.uint8)  # experiment with kernel size
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # For debugging, you can show the HSV channels:
    # cv2.imshow("Hue", hsv[:,:,0])
    # cv2.imshow("Saturation", hsv[:,:,1])
    # cv2.imshow("Value", hsv[:,:,2])
    
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), mask


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
    # Ensure pts is a (4,2) array.
    pts = pts.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def transform_perspective(image: np.ndarray, contour: np.ndarray) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    Perform perspective transform and return warped image, the transformation matrix, and the rotation angle.
    """
    pts = contour.reshape(-1, 2)
    # If the contour doesn't contain exactly 4 points, fall back to a bounding rectangle.
    if pts.shape[0] != 4:
        print('falling back: contour has {} points instead of 4'.format(pts.shape[0]))
        x, y, w, h = cv2.boundingRect(contour)
        pts = np.array([[x, y], [x+w, y], [x+w, y+h], [x, y+h]], dtype="float32")
    
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

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
    warped = cv2.convertScaleAbs(warped) 
    
    # Calculate rotation angle based on top edge
    angle = np.degrees(np.arctan2(tr[1]-tl[1], tr[0]-tl[0]))
    if abs(angle) > 1:
        center_pt = (maxWidth // 2, maxHeight // 2)
        R = cv2.getRotationMatrix2D(center_pt, angle, 1.0)
        warped = cv2.warpAffine(warped, R, (maxWidth, maxHeight))
    return warped, M, angle

def calculate_center(contour: np.ndarray) -> Tuple[int, int]:
    """
    Calculate the center using image moments.
    """
    M = cv2.moments(contour)
    if M["m00"] == 0:
        return (0, 0)
    
    center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
    return center

def calculate_center_using_warp(warped: np.ndarray, M: np.ndarray) -> Tuple[int, int]:
    """
    Calculate a more accurate center:
      1. Get the center of the warped image.
      2. Transform it back to the original image coordinates using the inverse warp.
    """
    h, w = warped.shape[:2]
    warped_center = np.array([[[w/2, h/2]]], dtype="float32")
    M_inv = np.linalg.inv(M)
    original_center = cv2.perspectiveTransform(warped_center, M_inv)
    center = (int(original_center[0][0][0]), int(original_center[0][0][1]))
    return center

def segment_notebook(thresh: np.ndarray) -> Optional[np.ndarray]:
    """
    Enhanced segmentation to approximate a quadrilateral (trapezoid) that fits the paper tightly.
    """
    # Find contours in the binary mask
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    largest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest) < 1000:
        return None
    peri = cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, 0.02 * peri, True)
    if len(approx) != 4:
        # Try with a larger epsilon
        approx = cv2.approxPolyDP(largest, 0.04 * peri, True)
        if len(approx) != 4:
            # Fallback: use convex hull and then extract 4 extreme points
            hull = cv2.convexHull(largest)
            pts = hull.reshape(-1, 2)
            rect = order_points(pts)
            return rect.reshape((4, 1, 2))
    return approx

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
    Open a window with a live feed from the camera (or video file) and let the user capture a frame
    by pressing the specified key.
    """
    cap = cv2.VideoCapture("new_paper.MOV")

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
    """Helper function to show debug windows."""
    cv2.imshow(name, image)
    if wait:
        cv2.waitKey(0)

def process_image(image: np.ndarray, debug: bool = True, show: bool=False) -> Tuple[np.ndarray, np.ndarray, Tuple[int, int], float]:
    """
    Runs through the complete pipeline with optional debug visualization using threshold-based segmentation.
    """
    # Grayscale and threshold
    gray, thresh = preprocess(image)
    if debug:
        show_debug_window("3. Threshold", thresh)
    
    # Use threshold segmentation instead of edge-based contour detection
    contour = segment_notebook(thresh)
    if contour is None:
        raise RuntimeError("Notebook segmentation failed")
    
    # Perspective transform using the segmented bounding box contour
    warped, M, angle = transform_perspective(image, contour)

    if debug:
        show_debug_window("5. Warped Perspective", warped)
    
    # Calculate center using the rotated tight box contour
    center = calculate_center_using_warp(warped, M)

    if show: 
        result = image.copy()
        cv2.drawContours(result, [contour], -1, (0, 255, 0), 2)
        cv2.circle(result, center, 10, (0, 0, 255), -1)
        cv2.putText(result, f"Center: {center}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        show_debug_window("Final Result", result, wait=True)

    return contour, warped, center, angle

def capture_continuous(camera_index: int = 0, process_frame=None) -> None:
    """
    Continuously capture and process frames from the camera (or video file).
    process_frame: optional callback function to process each frame.
    """
    cap = cv2.VideoCapture("new_paper.MOV")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            if process_frame:
                try:
                    contour, warped, center, angle = process_frame(frame)
                    # Draw results on frame
                    cv2.drawContours(frame, [contour], -1, (0, 255, 0), 2)
                    cv2.circle(frame, center, 10, (0, 0, 255), -1)
                    cv2.putText(frame, f"Angle: {angle:.1f}", (10, 30), 
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    # Show warped view alongside main view
                    cv2.imshow("Warped View", warped)
                except Exception as e:
                    print(f"Frame processing error: {e}")

            cv2.imshow("Tracking (Press 'q' to quit)", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    try:
        # Run continuous capture with processing
        capture_continuous(
            process_frame=lambda frame: process_image(frame, debug=False)
        )
    except Exception as e:
        print("Error:", e)
