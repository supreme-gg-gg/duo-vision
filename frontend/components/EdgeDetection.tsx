import React, { useRef, useState, useEffect, Dispatch } from "react";
import { View, StyleSheet, Text, Pressable, Button } from "react-native";
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
} from "@/algorithm/ImageProcessor";

const EdgeDetectionComponent: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [boundingBox, setBoundingBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const webViewRef = useRef<WebView>(null);

  // Add continuous frame capture
  useEffect(() => {
    let frameId: number;

    const captureFrame = async () => {
      if (cameraRef.current && isTracking) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.5,
        });

        if (photo?.uri && webViewRef.current) {
          webViewRef.current.postMessage(
            JSON.stringify({
              uri: photo.uri,
              isTracking,
            })
          );
        }

        frameId = requestAnimationFrame(captureFrame);
      }
    };

    if (isTracking) {
      captureFrame();
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isTracking]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.boundingBox) {
        setBoundingBox(data.boundingBox);
      }
    } catch (error) {
      console.error("Error processing WebView message:", error);
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
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef}>
          {boundingBox && isTracking && (
            <View
              style={[
                styles.boundingBox,
                {
                  left: boundingBox.x,
                  top: boundingBox.y,
                  width: boundingBox.width,
                  height: boundingBox.height,
                },
              ]}
            />
          )}
        </CameraView>
        <View style={styles.controlsContainer}>
          <Pressable
            style={[styles.button, isTracking && styles.buttonActive]}
            onPress={() => setIsTracking(!isTracking)}
          >
            <Text style={styles.buttonText}>
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          injectedJavaScript={generateInjectedJavaScript()}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error:", nativeEvent);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
    minHeight: 600, // Ensures minimum height for camera view
  },
  camera: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#fff",
    minHeight: 600, // Ensures minimum height for webview
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
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#666",
    padding: 10,
    borderRadius: 5,
  },
  buttonActive: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
  },
  boundingBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00ff00",
    zIndex: 1,
  },
});

export default EdgeDetectionComponent;
