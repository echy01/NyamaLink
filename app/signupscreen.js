import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const roles = ["customer", "butcher", "agent"];

const COLORS = {
  primary: "#FF746C",
  secondary: "#FF5A52",
  accent: "#E63946",
  buttonStart: "#DC2626",
  buttonMid: "#B91C1C",
  buttonEnd: "#991B1B",
  white: "#FFFFFF",
  textLight: "rgba(255, 255, 255, 0.95)",
  shadow: "#000000",
};

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      return Alert.alert("Error", "Please fill in all fields.");
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("Error", "Enter a valid email address.");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      const response = await fetch(
        "http://10.71.135.198:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert(
          "Signup Error",
          data.message || "Failed to create account"
        );
      }

      Alert.alert("Success", "Account created successfully!");
      router.push("/loginscreen");
    } catch (error) {
      console.error("Signup API error:", error);
      Alert.alert(
        "Error",
        "Unable to connect to server. Please try again later."
      );
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialIcons
            name="arrow-back"
            size={28}
            color={COLORS.white}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Create an Account</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Select Your Role:</Text>
          <View style={styles.roles}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleButton, role === r && styles.selectedRole]}
                onPress={() => setRole(r)}
              >
                <Text
                  style={role === r ? styles.selectedRoleText : styles.roleText}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <LinearGradient
              colors={[COLORS.buttonStart, COLORS.buttonMid, COLORS.buttonEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/loginscreen")}>
            <Text style={styles.loginLink}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 24,
    top: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    color: COLORS.white,
    fontSize: 16,
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
    marginTop: 10,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loginLink: {
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 12,
    fontSize: 15,
  },
  loginLinkBold: {
    fontWeight: "bold",
    color: COLORS.white,
  },
});
