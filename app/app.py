import random, time
from bluetooth import read_frame, send_servo_command
from controller import Controller
from processing import process_image
import serial
import cv2
import numpy as np

SERIAL_PORT = "/dev/cu.ESP32_CAM_BT"
BAUD_RATE = 115200

def main_pipeline():

    controller = Controller() 

    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)

    while True:
        # 1. Receive image frame from bluetooth
        frame_data = read_frame(ser)  # returns raw bytes
        if frame_data is None:
            time.sleep(0.1)
            continue
        np_arr = np.frombuffer(frame_data, dtype=np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            print("Failed to decode frame")
            continue
        cv2.imshow("Input frame", frame)

        try:
            # 2. Process frame to get paper center and angle
            _, _, center, paper_angle = process_image(frame, debug=False)
            print(f"Processed frame: Center={center}, Paper angle={paper_angle:.2f}")
        except Exception as e:
            print("Processing error:", e)
            continue

        # 3. Send back a random servo command
        a1, a2 = controller.get_angle(center)
        send_servo_command(ser, a1, a2)
        time.sleep(0.1)


if __name__ == "__main__":
    main_pipeline()

