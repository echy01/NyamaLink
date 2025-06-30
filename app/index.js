import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions, Platform } from "react-native"; // Added Platform
import { LinearGradient } from 'expo-linear-gradient';

import COLORS from './styles/colors';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryRed} />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.primaryRed, COLORS.darkRed]}
        style={localStyles.container}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
      >
        <View style={localStyles.content}>
          <View style={localStyles.logoContainer}>
            <Image
              source={require("../assets/images/NYAMALINK3.png")}
              style={localStyles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={localStyles.textContainer}>
            <Text style={localStyles.title}>NyamaLink</Text>
            <View style={localStyles.divider} />
            <Text style={localStyles.subtitle}>Fresh meat, seamless delivery</Text>
            <Text style={localStyles.description}>
              Connect with trusted butchers and slaughterhouses to get the freshest meat delivered right to your doorstep or manage your stock with ease.
            </Text>
          </View>

          <View style={localStyles.buttonContainer}>
            <TouchableOpacity
              style={localStyles.getStartedButton}
              onPress={() => router.push("/signupscreen")}
            >
              <Text style={localStyles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: height * 0.06,
  },
  logoContainer: {
    marginBottom: height * 0.05,
    borderRadius: 15,
    // backgroundColor: COLORS.white,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 30,
  },
  logo: {
    width: width * 0.75,
    height: (width * 0.75) * (100 / 100),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: height * 0.06,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 8,
    marginBottom: 10,
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', 
  },
  divider: {
    width: width * 0.6,
    height: 4,
    backgroundColor: COLORS.lightRed,
    borderRadius: 2.5,
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '200',
    color: COLORS.offWhite,
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: COLORS.offWhite,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 30,
    fontWeight: '500',
    maxWidth: width * 0.95,
  },
  buttonContainer: {
    width: '70%',
    marginTop: height * 0.06,
  },
  getStartedButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  getStartedButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryRed,
    letterSpacing: 1,
  },
});