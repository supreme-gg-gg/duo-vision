import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import { WebView } from "react-native-webview";

// ESP32 Stream URL (Replace with actual ESP32 IP)
const ESP32_STREAM_URL = "http://192.168.4.1/stream"; // MJPEG streaming URL

const WiFiHandler: React.FC = () => {
  const [streaming, setStreaming] = useState<boolean>(false);

  const startStreaming = () => {
    setStreaming(true);
  };

  const stopStreaming = () => {
    setStreaming(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 16, marginBottom: 10 }}>ESP32 Video Stream</Text>

      {streaming ? (
        <WebView
          source={{ uri: ESP32_STREAM_URL }}
          style={{ width: 300, height: 200 }}
        />
      ) : (
        <Text>Stream Stopped</Text>
      )}

      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <Button title="Start Stream" onPress={startStreaming} />
        <Button title="Stop Stream" onPress={stopStreaming} />
      </View>
    </View>
  );
};

export default WiFiHandler;
