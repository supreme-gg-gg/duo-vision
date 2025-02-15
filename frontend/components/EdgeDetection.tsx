import React, { useRef, useState, useEffect, Dispatch } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import {
  Camera,
  useCameraPermissions,
  CameraView,
  CameraType,
} from "expo-camera";
import { WebView } from "react-native-webview";
import {
  generateInjectedJavaScript,
  htmlContent,
} from "@/algorithm/edgeDetection";

export default function EdgeDetectionComponent({
  setRunning,
}: {
  setRunning: Dispatch<React.SetStateAction<boolean>>;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const webViewRef = useRef<WebView>(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        if (webViewRef.current) {
          webViewRef.current.postMessage(photo.uri);
        }
      }
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraContainer} ref={cameraRef}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          injectedJavaScript={generateInjectedJavaScript()}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error:", nativeEvent);
          }}
        />
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  cameraContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
