import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, StyleSheet, Text } from "react-native";
import axios from "axios";

const SERVER_IP = "192.168.1.100";
const IMAGE_URL = `http://${SERVER_IP}:5000/image`;

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(IMAGE_URL, { responseType: "blob" });
        setImageUri(URL.createObjectURL(response.data));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
    const interval = setInterval(fetchImage, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real Time Notes Feed</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        imageUri && <Image source={{ uri: imageUri }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  image: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
