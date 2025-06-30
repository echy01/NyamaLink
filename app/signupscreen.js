import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView, 
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar, 
} from "react-native";

import COLORS from './styles/colors'; 
import api from './api'; 

const { width } = Dimensions.get("window");

const roles = ["customer", "butcher", "agent"];

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !phoneNumber || !password || !confirmPassword || !role) {
      Alert.alert("Error", "Please fill in all fields including your role.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.signup({
        name,
        email,
        phoneNumber,
        password,
        role,
      });

      Alert.alert("Sign Up Successful", response.data.message || "Account created successfully! Please log in.");
      router.replace("/loginscreen");
    } catch (error) {
      console.error("Sign up error:", error);
      const message = error.response?.data?.message || error.message || 'Something went wrong during sign up.';
      Alert.alert("Sign Up Failed", message);
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today!</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color={COLORS.mediumGrey} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.mediumGrey}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={COLORS.mediumGrey} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.mediumGrey}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color={COLORS.mediumGrey} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={COLORS.mediumGrey}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={COLORS.mediumGrey} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.mediumGrey}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.mediumGrey} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.mediumGrey}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <Text style={styles.label}>Select Your Role:</Text>
            <View style={styles.rolesContainer}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleButton,
                    role === r && styles.selectedRole,
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[
                    styles.roleText,
                    role === r && styles.selectedRoleText,
                  ]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/loginscreen")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40, 
  },
  content: {
    width: "90%",
    maxWidth: 400,
    padding: 25,
    backgroundColor: COLORS.white, 
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
    fontFamily: 'serif', 
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
    marginBottom: 15,
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGrey, 
    marginBottom: 10, 
    marginTop: 10, 
  },
  rolesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20, 
    flexWrap: 'wrap', 
  },
  roleButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    backgroundColor: COLORS.offWhite,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10, 
    flex: 1, 
    marginHorizontal: 4, 
    alignItems: "center",
    minWidth: 100, 
    marginBottom: 8, 
  },
  selectedRole: {
    backgroundColor: COLORS.primaryRed, 
    borderColor: COLORS.primaryRed,
  },
  roleText: {
    color: COLORS.mediumGrey,
    fontWeight: "500",
    fontSize: 15,
  },
  selectedRoleText: {
    color: COLORS.white, 
    fontWeight: "bold",
  },
  signupButton: {
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
  signupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  loginText: {
    color: COLORS.mediumGrey,
    fontSize: 15,
  },
  loginLink: {
    color: COLORS.primaryRed,
    fontSize: 15,
    fontWeight: "bold",
  },
});