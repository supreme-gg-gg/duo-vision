# from bluetooth import send_servo_command
from wifi import send_servo_command, init_socket
from controller import Controller
from processing import process_image
# import serial
import cv2
import numpy as np
from typing import Callable

ESP32_IP = "192.168.2.74"
ESP32_PORT = 1234

def main(process_frame, camera_index: int = 0, ) -> None:
    """
    1. Continuously capture and process frames from the camera.
    2. Process each frame using the provided callback function.
    3. Send servo commands based on the processed frame.
    """

    # Initialize video capture, controller, socket
    cap = cv2.VideoCapture("new_paper.MOV")
    controller = Controller()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            try:
                # Process frame
                contour, warped, center, angle = process_frame(frame)

                # Draw results on frame
                cv2.drawContours(frame, [contour], -1, (0, 255, 0), 2)
                cv2.circle(frame, center, 10, (0, 0, 255), -1)
                cv2.putText(frame, f"Angle: {angle:.1f}", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # Then use the center to get the servo angles by controller
                a1, a2 = controller.get_angle(center)

                # Show warped view alongside main view
                # cv2.imshow("Warped View", warped)

                # Then we send the servo commands
                with open("servo_angles.txt", "a") as file:
                    file.write(f"{a1}, {a2}\n")
                
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
        main(
            process_frame=lambda frame: process_image(frame, debug=False)
        )
    except Exception as e:
        print("Error:", e)

# SERIAL_PORT = "/dev/cu.ESP32_CAM_BT"
# BAUD_RATE = 115200

# def main_pipeline():

#     controller = Controller() 

#     ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)

#     while True:
#         # 1. Receive image frame from bluetooth
#         frame_data = read_frame(ser)  # returns raw bytes
#         if frame_data is None:
#             time.sleep(0.1)
#             continue
#         np_arr = np.frombuffer(frame_data, dtype=np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
#         if frame is None:
#             print("Failed to decode frame")
#             continue
#         cv2.imshow("Input frame", frame)

#         try:
#             # 2. Process frame to get paper center and angle
#             _, _, center, paper_angle = process_image(frame, debug=False)
#             print(f"Processed frame: Center={center}, Paper angle={paper_angle:.2f}")
#         except Exception as e:
#             print("Processing error:", e)
#             continue

#         # 3. Send back a random servo command
#         a1, a2 = controller.get_angle(center)
#         send_servo_command(ser, a1, a2)
#         time.sleep(0.1)


# if __name__ == "__main__":
#     main_pipeline()

