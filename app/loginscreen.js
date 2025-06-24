import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, 
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, 
} from "react-native";

import globalStyles from './styles/globalStyles';
import COLORS from './styles/colors';
import api from './api'; 

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true); 
    try {
      const response = await api.login({ email, password });
      
      const { token, role, name } = response.data; 
      await AsyncStorage.setItem("token", token);

      router.replace(`/(dashboard)/?role=${role}&name=${encodeURIComponent(name)}`);

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={localStyles.safeArea}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.danger, '#8B0000']} 
        style={localStyles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.replace('/')} style={localStyles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <View style={localStyles.content}>
          <Text style={localStyles.title}>Welcome Back!</Text>
          <Text style={localStyles.subtitle}>Sign in to your account</Text>

          <View style={localStyles.formContainer}>
            <TextInput
              style={localStyles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={localStyles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={[localStyles.loginButton, loading && {opacity: 0.7}]}
              onPress={handleLogin}
              disabled={loading} 
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={localStyles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/signupscreen')}>
              <Text style={localStyles.signupText}>
                Don't have an account? <Text style={localStyles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  gradientContainer: {
    flex: 1,
    paddingTop: 80, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width: '100%',
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50, 
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.secondary, 
    textAlign: "center",
    marginBottom: 40,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, 
    alignSelf: 'center', 
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: COLORS.accent, 
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  signupText: {
    color: COLORS.textLight, 
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.secondary,  
    fontWeight: "bold",
  },
});
