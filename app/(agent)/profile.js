import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

import api from '../api';
import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';

const AgentProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userName = params.name || 'Slaughterhouse Agent';
  const userEmail = params.email || 'agent@example.com';

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('token');
            router.replace('/loginscreen');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Logout Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleUpdateLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'Please enable location to update.');
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const payload = {
        lat: coords.latitude,
        lng: coords.longitude,
      };

      await api.updateAgentLocation(payload);
      Alert.alert('Location Updated', 'Your current location has been saved.');
    } catch (err) {
      console.error('📍 Update Error:', err);
      Alert.alert('Error', 'Failed to update location. Try again.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.textDark} />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>

        <TouchableOpacity style={globalStyles.button} onPress={handleUpdateLocation}>
          <Ionicons name="location-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={globalStyles.buttonText}>Update My Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.buttonOutline} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={globalStyles.buttonOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
});

export default AgentProfileScreen;
