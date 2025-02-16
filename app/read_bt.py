# THIS FILE IS USED ONLY FOR TESTING

import serial
import struct
import time
import cv2
import numpy as np

# Adjust the serial port and baud rate as needed.
SERIAL_PORT = '/dev/rfcomm0'
BAUD_RATE = 115200

def read_frame(ser):
    # Read 4-byte header indicating the size of the image
    header = ser.read(4)
    if len(header) < 4:
        print("Incomplete header received")
        return None

    # Unpack header (little endian unsigned int)
    frame_size = struct.unpack('<I', header)[0]
    # Read the JPEG data
    data = ser.read(frame_size)
    if len(data) < frame_size:
        print("Incomplete frame received")
        return None

    return data

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)
    except Exception as e:
        print(f"Failed to open {SERIAL_PORT}: {e}")
        return

    print("Press 'q' to exit the video stream.")
    try:
        while True:
            frame_data = read_frame(ser)
            if frame_data is None:
                print("Error reading frame, retrying...")
                time.sleep(0.1)
                continue

            # Convert the JPEG data to a NumPy array
            np_arr = np.frombuffer(frame_data, dtype=np.uint8)
            # Decode the image from the NumPy array
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                print("Failed to decode frame")
                continue

            # Optionally, print out the resolution
            height, width = frame.shape[:2]
            print(f"Frame resolution: {width} x {height}")

            # Display the frame in a window
            cv2.imshow("Live Stream", frame)
            # Wait 1ms for key event. Press 'q' to quit.
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        ser.close()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
