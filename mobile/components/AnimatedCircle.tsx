import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

const AnimatedCircle = () => {
  return (
    <View>
      <ThemedView style={styles.circleContainer}>
        <ThemedView
          style={[
            styles.circle,
            {
              width: 100 * SCALE,
              height: 100 * SCALE,
              backgroundColor: "#221822",
            },
          ]}
        />
        <ThemedView
          style={[
            styles.circle,
            {
              width: 80 * SCALE,
              height: 80 * SCALE,
              backgroundColor: "#2F2337",
            },
          ]}
        />
        <ThemedView
          style={[
            styles.circle,
            {
              width: 60 * SCALE,
              height: 60 * SCALE,
              backgroundColor: "#382D3C",
            },
          ]}
        />
        <Image
          source={require("@/assets/images/glass_ball.png")}
          style={styles.centeredImage}
        />
      </ThemedView>
    </View>
  );
};

const SCALE = 1.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    flex: 1,
    position: "relative",
  },
  circle: {
    width: 100 * SCALE,
    height: 100 * SCALE,
    borderRadius: 50 * SCALE,
    backgroundColor: "red",
    position: "absolute",
  },
  centeredImage: {
    width: 60 * SCALE,
    height: 60 * SCALE,
    position: "absolute",
  },
});

export default AnimatedCircle;
