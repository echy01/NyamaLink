import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import CustomerDashboard from './customer';
// import AgentDashboard from './agent';
import COLORS from './styles/colors';

export default function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/loginscreen');
          return;
        }

        const role = params.role;
        const name = decodeURIComponent(params.name || '');

        if (role) {
          setUserRole(role);
          setUserName(name);
        } else {
          router.replace('/loginscreen');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/loginscreen');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && userRole) {
      switch (userRole) {
        case 'customer':
          router.replace(`/(customer)?name=${encodeURIComponent(userName)}`);
          return; 
        case 'butcher':
          router.replace(`/(butcher)?name=${encodeURIComponent(userName)}`);
          return;
        case 'agent':
          router.replace(`/(agent)?name=${encodeURIComponent(userName)}`);
          return;
        default:
          break;
      }
    }
  }, [loading, userRole, userName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Invalid user role or unhandled state.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
});
