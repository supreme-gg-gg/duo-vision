import React, { useRef, useState, useEffect } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { Camera } from "expo-camera";
import { WebView } from "react-native-webview";
import { htmlContent } from "@/algorithm/edgeDetection";

export default function EdgeDetectionComponent() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setCapturedUri(photo.uri);
      // Send the captured image URI to the WebView to process.
      if (webViewRef.current && photo.uri) {
        webViewRef.current.postMessage(photo.uri);
      }
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No camera permission granted.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
      <Button title="Capture" onPress={handleCapture} />
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  webview: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
