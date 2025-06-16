import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomerDashboard from './dashboard/customer';
import ButcherDashboard from './dashboard/butcher';
import AgentDashboard from './dashboard/agent';

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

        // Get role from params or decode from token
        const role = params.role;
        const name = decodeURIComponent(params.name || '');
        
        if (role) {
          setUserRole(role);
          setUserName(name);
        } else {
          // If no role in params, redirect to login
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cc0000" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  // Render appropriate dashboard based on role
  switch (userRole) {
    case 'customer':
      return <CustomerDashboard userName={userName} />;
    case 'butcher':
      return <ButcherDashboard userName={userName} />;
    case 'agent':
      return <AgentDashboard userName={userName} />;
    default:
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid user role</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#cc0000',
    fontWeight: 'bold',
  },
});