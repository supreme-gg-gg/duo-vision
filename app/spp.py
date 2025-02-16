import serial
import cv2
import numpy as np
import streamlit as st

# Bluetooth Serial Port - Replace with your ESP32's Bluetooth COM port
# BT_PORT = "COM5"  # Windows (Check Device Manager)
BT_PORT = "/dev/rfcomm0"  # Linux/macOS
BAUD_RATE = 115200  # Adjust based on your ESP32 settings

# Initialize Serial Connection
try:
    ser = serial.Serial(BT_PORT, BAUD_RATE, timeout=1)
    st.success(f"Connected to ESP32 on {BT_PORT}")
except Exception as e:
    st.error(f"Failed to connect: {e}")

# Streamlit UI
st.title("📡 ESP32 Bluetooth Video Stream")
st.write("Streaming video over Bluetooth SPP from ESP32.")

frame_placeholder = st.empty()

def read_video_frame():
    """ Reads a single frame from the Bluetooth serial port """
    try:
        # Read frame size (assume ESP sends frame size first)
        size_bytes = ser.read(4)
        if len(size_bytes) < 4:
            return None
        
        frame_size = int.from_bytes(size_bytes, byteorder='big')
        
        # Read frame data
        frame_data = ser.read(frame_size)
        if len(frame_data) != frame_size:
            return None

        # Convert to OpenCV image
        frame = np.frombuffer(frame_data, dtype=np.uint8)
        img = cv2.imdecode(frame, cv2.IMREAD_COLOR)
        
        return img
    except Exception as e:
        st.error(f"Error reading frame: {e}")
        return None

# Streaming loop
if st.button("Start Streaming"):
    st.write("Streaming...")
    while True:
        frame = read_video_frame()
        if frame is not None:
            frame_placeholder.image(frame, channels="BGR")

if st.button("Stop Streaming"):
    ser.close()
    st.warning("Disconnected from ESP32!")