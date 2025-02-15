import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";

export default function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleMenu}>
      <View style={[styles.line, isOpen && styles.lineOpen1]} />
      <View style={[styles.line, isOpen && styles.lineOpen2]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  line: {
    position: "absolute",
    width: 30,
    height: 3,
    backgroundColor: "white",
    transition: "transform 0.3s ease",
  },
  lineOpen1: {
    transform: [{ rotate: "45deg" }],
  },
  lineOpen2: {
    transform: [{ rotate: "-45deg" }],
  },
});
