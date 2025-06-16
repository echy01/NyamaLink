import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoCard from '../../components/InfoCard';
import globalStyles from '../styles/globalStyles';

const ButcherDashboard = ({ userName }) => {
  const [availableMeat, setAvailableMeat] = useState([]);
  const [slaughterOrders, setSlaughterOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAvailableMeat();
    loadSlaughterOrders();
  }, []);

  const loadAvailableMeat = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.137.1:5000/api/agent/purchase/available', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAvailableMeat(data.meat || []);
    } catch (err) {
      console.error('Error loading available meat:', err);
    }
  };

  const loadSlaughterOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.137.1:5000/api/butcher/slaughterhouse-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSlaughterOrders(data.orders || []);
    } catch (err) {
      console.error('Error loading slaughter orders:', err);
    }
  };

  const renderAvailableMeat = () => (
    <FlatList
      data={availableMeat}
      renderItem={({ item }) => (
        <InfoCard
          icon="cube"
          title={item.name}
          value={`KES ${item.price}/kg | Available: ${item.stock}kg`}
          subtitle={`From ${item.slaughterhouse}`}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAvailableMeat} />}
    />
  );

  const renderSlaughterOrders = () => (
    <FlatList
      data={slaughterOrders}
      renderItem={({ item }) => (
        <InfoCard
          icon="clipboard"
          title={`Order - ${item.meatType}`}
          value={`Qty: ${item.quantity}kg | Status: ${item.status}`}
          subtitle={`Slaughterhouse: ${item.slaughterhouseName}`}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSlaughterOrders} />}
    />
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>🔪 Purchase Meat</Text>
        <Ionicons name="cart-outline" size={24} color="#d32f2f" />
      </View>

      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Available Meat</Text>
      </View>

      <View style={globalStyles.content}>{renderAvailableMeat()}</View>

      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Your Orders</Text>
      </View>

      <View style={globalStyles.content}>{renderSlaughterOrders()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#222',
  },
});

export default ButcherDashboard;
