import serial
import serial.tools.list_ports
import struct
import time
import cv2
import numpy as np
import threading

# Adjust the serial port and baud rate as needed.
SERIAL_PORT = '/dev/tty.ESP32_CAM_BT'
BAUD_RATE = 115200

# Global flag to signal exit
exit_flag = False

def find_bluetooth_port():
    """Find available Bluetooth serial ports"""
    ports = list(serial.tools.list_ports.comports())
    bluetooth_ports = []
    
    for port in ports:
        if any(bt_id in port.description.lower() for bt_id in ['bluetooth', 'rfcomm', 'bt']):
            bluetooth_ports.append(port.device)
        # Also check for ESP32 specific identifiers
        elif any(esp_id in port.description for esp_id in ['CP210X', 'CH340', 'FTDI']):
            bluetooth_ports.append(port.device)
    
    return bluetooth_ports

def select_port():
    """Let user select the port"""
    bluetooth_ports = find_bluetooth_port()
    
    if not bluetooth_ports:
        print("No Bluetooth ports found. Available ports:")
        for port in serial.tools.list_ports.comports():
            print(f"- {port.device}: {port.description}")
        return input("Enter port manually: ")
    
    print("\nAvailable Bluetooth ports:")
    for i, port in enumerate(bluetooth_ports):
        print(f"{i+1}: {port}")
    
    while True:
        try:
            choice = int(input("\nSelect port number (or 0 to enter manually): "))
            if choice == 0:
                return input("Enter port manually: ")
            if 1 <= choice <= len(bluetooth_ports):
                return bluetooth_ports[choice-1]
        except ValueError:
            print("Please enter a valid number")

def send_servo_command(ser, angle):
    """Send a servo command to set the servo to the given angle on GPIO14."""
    if not ser.is_open:
        try:
            ser.open()
        except Exception as e:
            print("Failed to open port before writing:", e)
            return
    command = f"S14:{angle}\n"
    try:
        ser.write(command.encode())
        print(f"Sent servo command: {command.strip()}")
    except Exception as e:
        print("Error writing to port:", e)

def read_frame(ser):
    """Read a single video frame from the serial port."""
    if not ser.is_open:
        try:
            ser.open()
        except Exception as e:
            print("Failed to open port before reading:", e)
            return None

    header = ser.read(4)
    if len(header) < 4:
        print("Incomplete header received")
        return None

    frame_size = struct.unpack('<I', header)[0]
    data = ser.read(frame_size)
    if len(data) < frame_size:
        print("Incomplete frame received")
        return None
    return data


def servo_input_thread(ser):
    """Thread that reads user input from the terminal and sends servo commands."""
    global exit_flag
    
    # Replace the static SERIAL_PORT with dynamic selection
    # selected_port = select_port()
    # print(f"Attempting to connect to {selected_port}...")
    
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)
    except Exception as e:
        print(f"Failed to open port: {e}")
        return

    while not exit_flag:
        user_input = input("Enter servo angle (0-180) or 'q' to quit: ")
        if user_input.lower() == 'q':
            exit_flag = True
            break
        try:
            angle = int(user_input)
            if 0 <= angle <= 180:
                send_servo_command(ser, angle)
            else:
                print("Angle must be between 0 and 180")
        except ValueError:
            print("Invalid input. Please enter a number between 0 and 180, or 'q' to quit.")

def main():
    global exit_flag

    # Replace the static SERIAL_PORT with dynamic selection
    # selected_port = select_port()
    # print(f"Attempting to connect to {selected_port}...")

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=10)
    except Exception as e:
        print(f"Failed to open {SERIAL_PORT}: {e}")
        return

    # Start the servo input thread.
    input_thread = threading.Thread(target=servo_input_thread, args=(ser,), daemon=True)
    input_thread.start()

    print("Starting video stream. Press 'q' in the video window or enter 'q' in the terminal to quit.")

    try:
        while not exit_flag:
            frame_data = read_frame(ser)
            if frame_data is None:
                # If frame reading fails, wait a bit and try again.
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
            # Wait 1ms for key event. Press 'q' in the video window to quit.
            if cv2.waitKey(1) & 0xFF == ord('q'):
                exit_flag = True
                break

    except KeyboardInterrupt:
        print("Keyboard interrupt received, exiting...")
    finally:
        exit_flag = True
        ser.close()
        cv2.destroyAllWindows()
        input_thread.join()

if __name__ == '__main__':
    main()
