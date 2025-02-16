import asyncio
import numpy as np
import cv2
import streamlit as st
from bleak import BleakClient

# 🟢 Replace this with your ESP32 BLE MAC Address
ESP32_MAC = "XX:XX:XX:XX:XX:XX"  # e.g., "A4:C1:38:B2:12:34"
VIDEO_UUID = "0000xxxx-0000-1000-8000-00805f9b34fb"  # Replace with your ESP32 BLE characteristic UUID

# Global variable to stop streaming
streaming = False

# Async function to read BLE video stream
async def receive_video():
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

            except Exception as e:
                st.error(f"Error: {e}")
                streaming = False

# UI - Streamlit Layout
st.title("📡 ESP32 BLE Video Stream")
st.write("This app connects to an ESP32 BLE device and streams video in real-time.")

# Button to start streaming
if st.button("Start Streaming"):
    asyncio.run(receive_video())

# Button to stop streaming
if st.button("Stop Streaming"):
    streaming = False
    st.warning("Streaming Stopped!")