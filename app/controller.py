import time
import numpy as np
import cv2
from processing import process_notebook_image  # use functions from processing.py

# placeholder for receiving frame from Bluetooth SPP
def get_next_frame() -> np.ndarray:
    # ...code to read next frame bytes from Bluetooth SPP...
    # Convert bytes to image (e.g., using cv2.imdecode)
    # Return the decoded image
    pass

# placeholder for sending command via Bluetooth SPP
def send_bluetooth_command(cmd: str) -> None:
    # ...code to send the UTF-8 encoded command string over Bluetooth SPP...
    # e.g., serial.write(cmd.encode("utf-8"))
    pass

def tracker():
    prev_center = None
    while True:
        frame = get_next_frame()
        if frame is None:
            continue
        try:
            # Process frame to get contour, warped, center and paper angle.
            _, _, center, paper_angle = process_notebook_image(frame, debug=False)
        except Exception as e:
            # Could not process frame; skip it.
            continue

        if prev_center is None:
            velocity_angle = 0.0
        else:
            # Compute velocity vector components (dx, dy)
            dx = center[0] - prev_center[0]
            dy = center[1] - prev_center[1]
            # Calculate direction of velocity in degrees
            velocity_angle = np.degrees(np.arctan2(dy, dx))
        prev_center = center

        # Compose command: using paper angle (angle1) and velocity angle (angle2)
        cmd_str = f"CMD:{paper_angle:.2f}, {velocity_angle:.2f}\n"
        send_bluetooth_command(cmd_str)
        # Delay to control processing rate (adjust as necessary)
        time.sleep(0.1)

if __name__ == "__main__":
    tracker()
