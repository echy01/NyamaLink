// import { useRouter } from "expo-router";
// import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// export default function LandingScreen() {
//   const router = useRouter();

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="#FF746C" />
//       <LinearGradient
//         colors={['#FF746C', '#FF5A52', '#E63946']}
//         style={styles.container}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.content}>
//           {/* Logo with enhanced styling */}
//           <View style={styles.logoContainer}>
//             <View style={styles.logoShadow}>
//               <Image
//                 source={require("../assets/images/nyamalink.png")} 
//                 style={styles.logo}
//                 resizeMode="contain"
//               />
//             </View>
//           </View>

//           {/* Text content with better spacing */}
//           <View style={styles.textContainer}>
//             <Text style={styles.title}>NyamaLink</Text>
//             <View style={styles.divider} />
//             <Text style={styles.subtitle}>Fresh meat, seamless delivery</Text>
//             <Text style={styles.description}>
//               Connect with trusted butchers in your area for the freshest cuts delivered right to your door
//             </Text>
//           </View>

//           {/* Enhanced button */}
//           <TouchableOpacity 
//             style={styles.button} 
//             onPress={() => router.push("/signupscreen")}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={['#DC2626', '#B91C1C', '#991B1B']}
//               style={styles.buttonGradient}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//             >
//               <Text style={styles.buttonText}>Get Started</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Additional features preview */}
//           <View style={styles.featuresContainer}>
//             <View style={styles.feature}>
//               <Text style={styles.featureIcon}>🥩</Text>
//               <Text style={styles.featureText}>Premium Quality</Text>
//             </View>
//             <View style={styles.feature}>
//               <Text style={styles.featureIcon}>🚚</Text>
//               <Text style={styles.featureText}>Fast Delivery</Text>
//             </View>
//             <View style={styles.feature}>
//               <Text style={styles.featureIcon}>📱</Text>
//               <Text style={styles.featureText}>Easy Ordering</Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 60,
//     paddingBottom: 40,
//   },
//   logoContainer: {
//     marginBottom: 40,
//   },
//   logoShadow: {
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 16,
//   },
//   logo: {
//     width: 160,
//     height: 160,
//     borderRadius: 40,
//     borderWidth: 4,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   textContainer: {
//     alignItems: 'center',
//     marginBottom: 50,
//   },
//   title: {
//     fontSize: 42,
//     fontWeight: '800',
//     color: '#FFFFFF',
//     textAlign: 'center',
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//     marginBottom: 12,
//   },
//   divider: {
//     width: 60,
//     height: 3,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     borderRadius: 2,
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 22,
//     color: 'rgba(255, 255, 255, 0.95)',
//     textAlign: 'center',
//     fontWeight: '500',
//     marginBottom: 12,
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   description: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.9)',
//     textAlign: 'center',
//     lineHeight: 22,
//     paddingHorizontal: 30,
//     fontWeight: '400',
//     maxWidth: width * 0.85,
//   },
//   button: {
//     marginBottom: 40,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 12,
//   },
//   buttonGradient: {
//     paddingVertical: 16,
//     paddingHorizontal: 50,
//     borderRadius: 30,
//     minWidth: 200,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//   },
//   featuresContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     maxWidth: 320,
//     paddingHorizontal: 10,
//   },
//   feature: {
//     alignItems: 'center',
//     opacity: 0.95,
//     flex: 1,
//   },
//   featureIcon: {
//     fontSize: 28,
//     marginBottom: 6,
//   },
//   featureText: {
//     color: 'rgba(255, 255, 255, 0.95)',
//     fontSize: 13,
//     fontWeight: '600',
//     textAlign: 'center',
//     lineHeight: 16,
//   },
// });

import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Color constants for easier maintenance
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

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Logo with improved visibility */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <View style={styles.logoShadow}>
                <Image
                  source={require("../assets/images/nyamalink.png")} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>NyamaLink</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>Fresh meat, seamless delivery</Text>
            <Text style={styles.description}>
              Connect with trusted butchers in your area for the freshest cuts delivered right to your door
            </Text>
          </View>

          {/* Hero image placeholder - would use actual meat image in production */}
          <View style={styles.heroPlaceholder}>
            <MaterialIcons name="image" size={50} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Enhanced button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push("/signupscreen")}
            activeOpacity={0.8}
            accessibilityLabel="Get started with NyamaLink"
          >
            <LinearGradient
              colors={[COLORS.buttonStart, COLORS.buttonMid, COLORS.buttonEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Improved features section with custom icons */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <MaterialIcons name="grade" size={28} color={COLORS.white} style={styles.featureIcon} />
              <Text style={styles.featureText}>Premium Quality</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="delivery-dining" size={28} color={COLORS.white} style={styles.featureIcon} />
              <Text style={styles.featureText}>Fast Delivery</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="smartphone" size={28} color={COLORS.white} style={styles.featureIcon} />
              <Text style={styles.featureText}>Easy Ordering</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 40,
    padding: 8,
  },
  logoShadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '400',
    maxWidth: width * 0.85,
  },
  heroPlaceholder: {
    width: width * 0.8,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    marginBottom: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  feature: {
    alignItems: 'center',
    opacity: 0.95,
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
});