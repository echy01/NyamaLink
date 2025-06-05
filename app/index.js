import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/nyamalink.png")} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>NyamaLink</Text>
      <Text style={styles.subtitle}>Fresh meat, seamless delivery</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/signupscreen")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#088888", 
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 50,
    borderWidth: 5, 
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 30,
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: "#cc0000", 
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});