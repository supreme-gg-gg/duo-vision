import socket
import struct
import cv2
import numpy as np
import threading

# Update with your ESP32's IP address and port (must match your ESP32 sketch)
ESP32_IP = "192.168.2.74"  # Replace with your ESP32 IP address
ESP32_PORT = 1234

def init_socket(ip: str, port: int) -> socket.socket:
    """Create a TCP/IP socket and connect to the ESP32."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((ip, port))
        print(f"Connected to ESP32 at {ip}:{port}")
        return sock
    except Exception as e:
        print(f"Could not connect to ESP32: {e}")
        return None

def recvall(sock, count):
    """Helper function to receive exactly 'count' bytes from the socket."""
    buf = b""
    while count:
        newbuf = sock.recv(count)
        if not newbuf:
            return None
        buf += newbuf
        count -= len(newbuf)
    return buf

def receive_images(sock):
    """Continuously receive JPEG frames from the ESP32 and display them."""
    while True:
        # First, receive the 4-byte frame size.
        size_data = recvall(sock, 4)
        if not size_data:
            print("Failed to receive frame size. Exiting image receiver.")
            break
        frame_size = struct.unpack("<I", size_data)[0]
        
        # Then, receive the actual JPEG frame data.
        frame_data = recvall(sock, frame_size)
        if not frame_data:
            print("Failed to receive frame data. Exiting image receiver.")
            break

        # Decode the JPEG data to an image.
        np_arr = np.frombuffer(frame_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is not None:
            cv2.imshow("ESP32 Camera Stream", img)
            # Press ESC in the image window to quit
            if cv2.waitKey(1) == 27:
                break
        else:
            print("Failed to decode image.")

    sock.close()
    cv2.destroyAllWindows()

def send_servo_command(sock, angle1: int, angle2: int) -> None:
    """
    Sends a servo command over WiFi via the socket.
    Command format: "CMD:<angle1>,<angle2>\n"
    """
    command = f"CMD:{angle1},{angle2}\n"
    try:
        sock.sendall(command.encode("utf-8"))
        print(f"DEBUG: Sent command over socket: {command.strip()}")
    except Exception as e:
        print(f"Error sending command over socket: {e}")

def send_servo_commands(sock):
    """
    Interactive mode: Read user input and send servo commands using send_servo_command.
    """
    print("Enter servo commands as two angles separated by a comma (e.g., 90,45).")
    print("Type 'q' to quit.")
    while True:
        user_input = input("Enter servo command: ").strip()
        if user_input.lower() == "q":
            break
        parts = user_input.split(',')
        if len(parts) != 2:
            print("Invalid format. Please enter two angles separated by a comma.")
            continue
        try:
            angle1 = int(parts[0].strip())
            angle2 = int(parts[1].strip())
        except ValueError:
            print("Invalid numbers. Please enter integer values.")
            continue

        send_servo_command(sock, angle1, angle2)

def main():
    # Initialize the socket connection to the ESP32.
    sock = init_socket(ESP32_IP, ESP32_PORT)
    if sock is None:
        print("Exiting.")
        return

    # Start a thread to receive and display images.
    image_thread = threading.Thread(target=receive_images, args=(sock,), daemon=True)
    image_thread.start()

    # In the main thread, handle sending servo commands.
    send_servo_commands(sock)

    print("Closing connection and exiting.")
    sock.close()

if __name__ == "__main__":
    main()
