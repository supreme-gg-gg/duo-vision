import { Image, StyleSheet, Platform, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// import CameraDisplay from "@/components/CameraDisplay";
import EdgeDetectionComponent from "@/components/EdgeDetection";
import AnimatedCircle from "@/components/AnimatedCircle";
import MenuButton from "@/components/MenuButton";
import { useState } from "react";

export default function HomeScreen() {
  const [running, setRunning] = useState();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 20,
          maxHeight: 200,
        }}
      >
        <EdgeDetectionComponent setRunning={setRunning} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
