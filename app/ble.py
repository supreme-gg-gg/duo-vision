import asyncio, time
import numpy as np
import cv2
import streamlit as st
from bleak import BleakClient

# BLE Configuration
ESP32_MAC = "08:D1:F9:97:A9:16"
VIDEO_UUID = "0000xxxx-0000-1000-8000-00805f9b34fb"
SERVO_UUID = "0000yyyy-0000-1000-8000-00805f9b34fb"

streaming = False
last_servo_angle = 90  # Track last sent angle to avoid redundant updates

async def send_servo_command(client, angle: int):
    """Send servo angle command to ESP32"""
    global last_servo_angle
    if angle != last_servo_angle:
        try:
            # Convert angle to byte format (0-180 to single byte)
            await client.write_gatt_char(SERVO_UUID, bytes([angle]))
            last_servo_angle = angle
            st.sidebar.write(f"Servo angle: {angle}°")
        except Exception as e:
            st.error(f"Failed to send servo command: {e}")

async def receive_video():
    """Receive video stream from ESP32 and display in Streamlit"""
    global streaming
    streaming = True

    async with BleakClient(ESP32_MAC) as client:
        if not await client.is_connected():
            st.error("Failed to connect to ESP32!")
            return

        st.success("Connected to ESP32! Streaming video...")
        frame_placeholder = st.empty()

        while streaming:
            try:
                frame_data = await client.read_gatt_char(VIDEO_UUID)
                
                # Convert byte data to numpy array
                frame_bytes = np.frombuffer(frame_data, dtype=np.uint8)
                img = cv2.imdecode(frame_bytes, cv2.IMREAD_COLOR)

                if img is not None:
                    frame_placeholder.image(img, channels="BGR")

                # Mock servo control based on object position
                # In real implementation, this would come from the mobile app
                mock_angle = (int(time.time() * 10) % 180)  # Oscillate between 0-180
                await send_servo_command(client, mock_angle)

            except Exception as e:
                st.error(f"Error: {e}")
                streaming = False

# UI Layout
st.title("📡 ESP32 BLE Video Stream with Servo Control")
st.write("Streaming video and controlling servo based on object position")

# Add servo control status to sidebar
st.sidebar.title("Servo Control")
st.sidebar.write("Current angle: waiting for data...")

# Button to start streaming
if st.button("Start Streaming"):
    asyncio.run(receive_video())

# Button to stop streaming
if st.button("Stop Streaming"):
    streaming = False
    st.warning("Streaming Stopped!")