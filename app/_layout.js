import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View, Text, StyleSheet, StatusBar } from 'react-native';
import COLORS from './styles/colors';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    // Add fonts if needed
    // 'Poppins_400Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    // 'Poppins_600SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textDark,
  },
});

export default RootLayout;
