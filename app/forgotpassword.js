// app/forgotpassword.js
import { MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar, // Import StatusBar
} from "react-native";

import COLORS from './styles/colors'; // Ensure this path is correct
import api from './api'; // Ensure this path is correct

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.requestReset({ email });

      Alert.alert('OTP Sent', response.data.message || 'Check your email for the reset code.');
      console.log('🚀 Navigating to resetpassword with:', email);

      // Optionally pass the email to prefill on next screen
      router.push({
        pathname: '/resetpassword',
        params: { email },
      });
    } catch (error) {
      console.error('Reset request error:', error);
      const message = error.response?.data?.message || error.message || 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primaryRed, COLORS.darkRed]} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryRed} />

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email to receive a reset code.</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={COLORS.mediumGrey} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.mediumGrey}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={styles.sendOtpButton} // Renamed for clarity
            onPress={handleRequestReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.sendOtpButtonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.backToLoginContainer}>
            <TouchableOpacity onPress={() => router.replace("/loginscreen")}>
              <Text style={styles.backToLoginText}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxWidth: 400,
    padding: 25,
    backgroundColor: COLORS.white, // White card background
    borderRadius: 15,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.darkGrey,
    marginBottom: 10,
    fontFamily: 'serif', // Consistent font
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mediumGrey,
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: 10,
    marginBottom: 20, // Increased margin for spacing before button
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.darkGrey,
    fontSize: 16,
  },
  sendOtpButton: { // Renamed from 'button' for clarity
    backgroundColor: COLORS.primaryRed,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 55,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  sendOtpButtonText: { // Renamed from 'buttonText'
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  backToLoginContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  backToLoginText: {
    color: COLORS.primaryRed, // Use primary red for links
    fontSize: 15,
    fontWeight: "bold",
  },
});