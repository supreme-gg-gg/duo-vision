const ESP32_API_URL = "http://192.168.4.1/control"; // Replace with actual ESP32 IP

// Mock function to calculate control signals (e.g., motor adjustments)
export const calculateControlSignals = (): {
  angleX: number;
  angleY: number;
} => {
  // Mock example: Adjust mirror angles randomly
  return {
    angleX: Math.random() * 180, // Adjusts mirror X-axis (0-180°)
    angleY: Math.random() * 180, // Adjusts mirror Y-axis (0-180°)
  };
};

// Function to send control signals to ESP32
export const sendControlSignals = async () => {
  const controlData = calculateControlSignals(); // Get control values

  try {
    const response = await fetch(ESP32_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(controlData),
    });

    if (!response.ok) {
      throw new Error(`Failed to send controls: ${response.status}`);
    }

    console.log("✅ Control signals sent:", controlData);
  } catch (error) {
    console.error("❌ Error sending control signals:", error);
  }
};
