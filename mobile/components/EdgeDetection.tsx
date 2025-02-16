import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Text, Pressable, Button } from "react-native";
import { Camera, useCameraPermissions, CameraView } from "expo-camera";
import Canvas from "react-native-canvas";
import { processFrame } from "@/algorithm/ImageProcessor";

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
  const frameProcessingActive = useRef(true);
  const canvasRef = useRef<Canvas>(null);

  // Process the captured image directly
  const processImage = async (
    base64Data: string,
    width: number,
    height: number
  ) => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Create image from base64
      const img = new Canvas.Image(canvas);
      img.src = `data:image/jpeg;base64,${base64Data}`;

      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(null);
        };
      });

      const box = await processFrame(canvas, width, height);
      setBoundingBox({
        x: box.topLeft.x,
        y: box.topLeft.y,
        width: box.topRight.x - box.topLeft.x,
        height: box.bottomLeft.y - box.topLeft.y,
      });
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  // Continuous frame capture
  useEffect(() => {
    let isActive = true;

    const captureFrame = async () => {
      if (!cameraRef.current || !isTracking || !frameProcessingActive.current)
        return;

      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.5,
          skipProcessing: true, // Faster processing
        });

        if (photo?.base64 && isActive) {
          await processImage(photo.base64, photo.width, photo.height);
        }

        // Schedule next frame only if still tracking
        if (isActive && isTracking) {
          requestAnimationFrame(captureFrame);
        }
      } catch (error) {
        console.error("Error capturing frame:", error);
      }
    };

    if (isTracking) {
      frameProcessingActive.current = true;
      captureFrame();
    }

    return () => {
      isActive = false;
      frameProcessingActive.current = false;
    };
  }, [isTracking]);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={{ display: "none" }} />
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          // Add these props for better performance
          ratio="16:9"
        >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  cameraContainer: { flex: 1, position: "relative", minHeight: 600 },
  camera: { flex: 1 },
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
  button: { backgroundColor: "#666", padding: 10, borderRadius: 5 },
  buttonActive: { backgroundColor: "#4CAF50" },
  buttonText: { color: "white" },
  boundingBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00ff00",
    zIndex: 1,
  },
  message: { textAlign: "center", paddingBottom: 10 },
});

export default EdgeDetectionComponent;
