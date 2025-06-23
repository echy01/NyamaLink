// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { useState } from "react";
// import {
//   Alert,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// const router = useRouter();

// export default function LoginScreen() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleLogin = async () => {
//     if (!email || !password) {
//       return Alert.alert("Error", "Please fill in all fields.");
//     }

//     try {
//       const response = await fetch(
//         "http://192.168.100.48:5000/api/auth/login",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, password }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) throw new Error(data.message || "Login failed");

//       await AsyncStorage.setItem("token", data.token);

//       router.push(
//         `/dashboard?role=${data.user.role}&name=${encodeURIComponent(
//           data.user.name
//         )}`
//       );
//     } catch (err) {
//       Alert.alert("Login Error", err.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email Address"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//         <Text style={styles.loginButtonText}>Log In</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.push("/signupscreen")}>
//         <Text style={styles.signupLink}>Don't have an account? Sign up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 24,
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#cc0000",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderWidth: 1.5,
//     borderColor: "#cc0000",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//   },
//   loginButton: {
//     backgroundColor: "#cc0000",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   loginButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   signupLink: {
//     color: "#000",
//     textAlign: "center",
//     marginTop: 16,
//   },
// });


import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF746C',
  secondary: '#FF5A52',
  accent: '#E63946',
  buttonStart: '#DC2626',
  buttonMid: '#B91C1C',
  buttonEnd: '#991B1B',
  white: '#FFFFFF',
  textLight: 'rgba(255, 255, 255, 0.95)',
  shadow: '#000000'
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Your existing login logic
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons 
            name="arrow-back" 
            size={28} 
            color={COLORS.white} 
            onPress={() => router.back()} 
            style={styles.backButton}
          />
          <Text style={styles.title}>Login</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="rgba(255,255,255,0.7)"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <LinearGradient
              colors={[COLORS.buttonStart, COLORS.buttonMid, COLORS.buttonEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signupscreen")}>
            <Text style={styles.signupLink}>
              Don't have an account? <Text style={styles.signupLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  header: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    color: COLORS.white,
    fontSize: 16,
  },
  loginButton: {
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
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signupLink: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 15,
  },
  signupLinkBold: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
});