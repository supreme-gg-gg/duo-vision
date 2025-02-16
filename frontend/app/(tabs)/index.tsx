import React, { useState } from "react";
import { Image, StyleSheet, Platform } from "react-native";

// import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// import CameraDisplay from "@/components/CameraDisplay";
import EdgeDetectionComponent from "@/components/EdgeDetection";
// import DeviceModal from "@/components/DeviceConnectionModel";
// import useBLE from "@/components/useBLE";

export default function HomeScreen() {
  // const {
  //   allDevices,
  //   connectedDevice,
  // //   connectToDevice,
  // //   color,
  // //   requestPermissions,
  // //   scanForPeripherals,
  // // } = useBLE();
  // // const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // const scanForDevices = async () => {
  //   const isPermissionsEnabled = await requestPermissions();
  //   if (isPermissionsEnabled) {
  //     scanForPeripherals();
  //   }
  // };

  // const hideModal = () => {
  //   setIsModalVisible(false);
  // };

  // const openModal = async () => {
  //   scanForDevices();
  //   setIsModalVisible(true);
  // };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <EdgeDetectionComponent />
    </ParallaxScrollView>
  );

  // return (
  //   <SafeAreaView style={[styles.container, { backgroundColor: color }]}>
  //     <View style={styles.heartRateTitleWrapper}>
  //       {connectedDevice ? (
  //         <>
  //           <Text style={styles.heartRateTitleText}>Connected</Text>
  //         </>
  //       ) : (
  //         <Text style={styles.heartRateTitleText}>
  //           Please connect the Arduino
  //         </Text>
  //       )}
  //     </View>
  //     <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
  //       <Text style={styles.ctaButtonText}>Connect</Text>
  //     </TouchableOpacity>
  //     <DeviceModal
  //       closeModal={hideModal}
  //       visible={isModalVisible}
  //       connectToPeripheral={connectToDevice}
  //       devices={allDevices}
  //     />
  //   </SafeAreaView>
  // );
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f2f2f2",
//   },
//   heartRateTitleWrapper: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   heartRateTitleText: {
//     fontSize: 30,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginHorizontal: 20,
//     color: "black",
//   },
//   heartRateText: {
//     fontSize: 25,
//     marginTop: 15,
//   },
//   ctaButton: {
//     backgroundColor: "#FF6060",
//     justifyContent: "center",
//     alignItems: "center",
//     height: 50,
//     marginHorizontal: 20,
//     marginBottom: 5,
//     borderRadius: 8,
//   },
//   ctaButtonText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "white",
//   },
// });
