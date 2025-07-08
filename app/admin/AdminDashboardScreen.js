import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';
import api from '../api';
import InfoCard from '../../components/InfoCard';

const { width, height } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState('Admin');

  const getCustomers = () => users.filter(user => user.role === 'customer');
  const getButchers = () => users.filter(user => user.role === 'butcher');
  const getAgents = () => users.filter(user => user.role === 'agent');
  const getAdmins = () => users.filter(user => user.role === 'admin');

  const fetchAdminData = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      const userString = await AsyncStorage.getItem('user');
      const currentUser = userString ? JSON.parse(userString) : null;

      if (currentUser && currentUser.name) {
        setAdminName(currentUser.name);
      }

      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to access the admin dashboard.');
        router.replace('/loginscreen');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const usersResponse = await api.getAdminUsers();
      if (usersResponse.status === 401 || usersResponse.status === 403) {
        Alert.alert('Session Expired', 'Your session has expired or you are not authorized. Please log in again.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/loginscreen');
        return;
      }
      setUsers(usersResponse.data);

      const ordersResponse = await api.getAdminOrders();
      if (ordersResponse.status === 401 || ordersResponse.status === 403) {
        Alert.alert('Session Expired', 'Your session has expired or you are not authorized. Please log in again.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/loginscreen');
        return;
      }
      setOrders(ordersResponse.data);

    } catch (err) {
      console.error("Error fetching admin data:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Network error. Ensure backend is running and URL is correct.';
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        Alert.alert('Session Expired', 'Your session has expired or you are not authorized. Please log in again.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/loginscreen');
        return;
      }
      setError(`Failed to load data: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          router.replace('/loginscreen');
        }
      }
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryRed} />
        <Text style={globalStyles.loadingText}>Loading Admin Data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text style={[globalStyles.emptyStateText, localStyles.errorTextOverride]}>Error: {error}</Text>
        <TouchableOpacity style={globalStyles.button} onPress={fetchAdminData}>
          <Text style={globalStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Dark content for light background */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAdminData}
            colors={[COLORS.primaryRed]}
            tintColor={COLORS.primaryRed}
          />
        }
      >
        <View style={localStyles.overviewContainer}>
          <View style={localStyles.sectionHeaderContainer}>
            <Text style={localStyles.greetingText}>
              Welcome, <Text style={{ fontWeight: 'bold', color: COLORS.primaryRed }}>{adminName}!</Text>
            </Text>
          </View>

          <Text style={[globalStyles.sectionHeader, { color: COLORS.textDark }]}>Quick Summaries</Text>

          <InfoCard title="Total Users" value={String(users.length)} subtitle="All registered accounts" icon="people-outline" color={COLORS.info} />
          <InfoCard title="Customers" value={String(getCustomers().length)} subtitle="Users placing orders" icon="person-outline" color={COLORS.accent} />
          <InfoCard title="Butchers" value={String(getButchers().length)} subtitle="Meat providers" icon="cut-outline" color={COLORS.warning} />
          <InfoCard title="Agents" value={String(getAgents().length)} subtitle="Slaughterhouse representatives" icon="business-outline" color={COLORS.success} />
          <InfoCard title="Admins" value={String(getAdmins().length)} subtitle="System administrators" icon="shield-checkmark-outline" color={COLORS.primaryRed} />

          <Text style={[globalStyles.sectionHeader, { marginTop: 20, color: COLORS.textDark }]}>Orders Overview</Text>
          <InfoCard title="Total Orders" value={String(orders.length)} subtitle="All orders placed" icon="receipt-outline" color={COLORS.darkGrey} />
          <InfoCard title="Pending Orders" value={String(orders.filter(o => o.status === 'pending').length)} subtitle="Awaiting acceptance" icon="hourglass-outline" color={COLORS.warning} />
          <InfoCard title="Delivered Orders" value={String(orders.filter(o => o.status === 'completed').length)} subtitle="Successfully completed" icon="checkmark-circle-outline" color={COLORS.success} />

          <Text style={[globalStyles.sectionHeader, { marginTop: 20, color: COLORS.textDark }]}>Recent Users</Text>
          <View style={globalStyles.card}>
            {users.length > 0 ? (
              <FlatList
                data={users.slice(0, 5)}
                keyExtractor={(item) => item._id || item.userId}
                renderItem={({ item }) => (
                  <View style={localStyles.listItem}>
                    <Text style={globalStyles.text}>Name: {item.name || 'N/A'}</Text>
                    <Text style={globalStyles.text}>Role: {item.role || 'N/A'}</Text>
                    <Text style={globalStyles.text}>Email: {item.email || 'N/A'}</Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            ) : (
              <Text style={globalStyles.emptyStateText}>No users registered yet.</Text>
            )}
          </View>

          <Text style={[globalStyles.sectionHeader, { marginTop: 20, color: COLORS.textDark }]}>Recent Orders</Text>
          <View style={globalStyles.card}>
            {orders.length > 0 ? (
              <FlatList
                data={orders.slice(0, 5)}
                keyExtractor={(item) => item._id || item.orderId}
                renderItem={({ item }) => (
                  <View style={localStyles.listItem}>
                    <Text style={globalStyles.text}>Order ID: {item.orderId || 'N/A'}</Text>
                    <Text style={globalStyles.text}>Status: {item.status || 'N/A'}</Text>
                    <Text style={globalStyles.text}>Total: ${item.totalPrice ? item.totalPrice.toFixed(2) : 'N/A'}</Text>
                    <Text style={globalStyles.text}>Customer: {item.customerName || 'N/A'}</Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            ) : (
              <Text style={globalStyles.emptyStateText}>No orders placed yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    backgroundColor: COLORS.bg,
  },
  overviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 0,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  logoutButton: {
    padding: 8,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textDark,
    flexShrink: 1,
    marginRight: 10,
  },
  listItem: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  errorTextOverride: {
    color: COLORS.danger,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
