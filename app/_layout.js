import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../utils/socket";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import COLORS from "./styles/colors";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    // Add fonts if needed
    // 'Poppins_400Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    // 'Poppins_600SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  // 🟢 Handle splash screen
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 🟢 Join Socket.IO room based on user ID
  useEffect(() => {
    const joinUserRoom = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user?._id) {
            socket.emit("join_room", user._id);
            console.log("🔗 Joined room:", user._id);
          }
        }
      } catch (err) {
        console.error("🔴 Failed to join socket room:", err);
      }
    };

    joinUserRoom();
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={localStyles.loadingText}>Loading app...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textDark,
  },
});

export default RootLayout;
