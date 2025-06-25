// app/signupscreen.js
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, // Keeping Alert for quick feedback
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator, // Added for loading state
} from "react-native";

import COLORS from './styles/colors'; // Import your COLORS file
import api from './api'; // Import your API utility

const { width } = Dimensions.get("window");

const roles = ["customer", "butcher", "agent"];

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      Alert.alert("Error", "Please fill in all fields and select a role.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      // Use the API utility for signup
      const response = await api.signup({ name, email, password, role });
      
      const { token, user } = response.data; // Assuming API returns token and user object with role and name

      await Alert.alert("Success", "Account created successfully! Please log in.");
      // After successful signup and showing alert, navigate to login screen
      router.replace('/loginscreen'); 

    } catch (error) {
      console.error("Sign Up error:", error.response?.data || error.message);
      Alert.alert("Sign Up Failed", error.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <View style={localStyles.safeArea}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.danger, '#8B0000']} // Consistent gradient with login
        style={localStyles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.replace('/')} style={localStyles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={localStyles.scrollContent}>
          <Text style={localStyles.title}>Create Account</Text>
          <Text style={localStyles.subtitle}>Join us today!</Text>

          <View style={localStyles.formContainer}>
            <TextInput
              style={localStyles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
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
            <TextInput
              style={localStyles.input}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Text style={localStyles.label}>Select Your Role:</Text>
            <View style={localStyles.roles}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[localStyles.roleButton, role === r && localStyles.selectedRole]}
                  onPress={() => setRole(r)}
                  disabled={loading} // Disable role selection while loading
                >
                  <Text style={[localStyles.roleText, role === r && localStyles.selectedRoleText]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[localStyles.signupButton, loading && {opacity: 0.7}]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={localStyles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/loginscreen')}>
              <Text style={localStyles.loginText}>
                Already have an account? <Text style={localStyles.loginLink}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    paddingTop: 80, // Adjust for status bar and header space
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40, // Ensure content isn't cut off at the bottom
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
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  roles: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: COLORS.white,
  },
  roleText: {
    color: COLORS.textLight,
    fontWeight: "500",
  },
  selectedRoleText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: COLORS.accent, // Distinct accent color for the button
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
  loginText: {
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
  loginLink: {
    fontWeight: "bold",
    color: COLORS.secondary,
  },
});
