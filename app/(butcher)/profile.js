import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import globalStyles from '../styles/globalStyles'; 
import COLORS from '../styles/colors';          

const ButcherProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userName = params.name || 'Butcher User'; 

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert("Logged Out", "You have been successfully logged out.");
      // Navigate back to the login screen
      router.replace('/loginscreen'); 
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.profileContainer}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.textDark} />
        <Text style={localStyles.profileName}>{String(userName)}</Text>
        <Text style={localStyles.profileRole}>Role: Butcher</Text>
        <TouchableOpacity style={globalStyles.buttonOutline} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={globalStyles.buttonOutlineText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.bg, 
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
});

export default ButcherProfileScreen;
