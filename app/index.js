import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

import globalStyles from './styles/globalStyles';
import COLORS from './styles/colors';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.danger, '#8B0000']}
        style={localStyles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={localStyles.content}>
          {/* Logo with enhanced styling */}
          <View style={localStyles.logoContainer}>
            <View style={localStyles.logoShadow}>
              <Image
                source={require("../assets/images/nyamalink.png")} 
                style={localStyles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Text content with better spacing */}
          <View style={localStyles.textContainer}>
            <Text style={localStyles.title}>NyamaLink</Text>
            <View style={localStyles.divider} />
            <Text style={localStyles.subtitle}>Fresh meat, seamless delivery</Text>
            <Text style={localStyles.description}>
              Connect with trusted butchers and slaughterhouses to get the freshest meat delivered to your doorstep or manage your stock with ease.
            </Text>
          </View>

          {/* Buttons with gradient and shadow */}
          <TouchableOpacity 
            style={localStyles.button}
            onPress={() => router.push('/loginscreen')}
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.primary]} 
              style={localStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={localStyles.buttonText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={localStyles.button}
            onPress={() => router.push('/signupscreen')}
          >
            <LinearGradient
              colors={[COLORS.success, COLORS.info]} 
              style={localStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={localStyles.buttonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, 
    paddingBottom: 20, 
  },
  logoContainer: {
    marginBottom: 40,
    marginTop: -50, 
  },
  logoShadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  logo: {
    width: width * 0.7, 
    height: width * 0.7 * (200 / 600), 
    tintColor: COLORS.white, 
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 48,
    fontWeight: '900', 
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.4)', 
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 5,
    marginBottom: 10,
    letterSpacing: 1, 
  },
  divider: {
    width: width * 0.4,
    height: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 22, 
    fontWeight: '600',
    color: COLORS.secondary, 
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight, 
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400',
    maxWidth: width * 0.85,
  },
  button: {
    marginBottom: 20, 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30, 
    minWidth: 220, 
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
