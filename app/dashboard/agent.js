import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';
import globalStyles from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import InfoCard from '../../components/InfoCard';

const TABS = ['Home', 'Inventory', 'Orders', 'Butchers'];

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [butchers, setButchers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryRes, ordersRes, butchersRes] = await Promise.all([
          api.getSlaughterhouseInventory(),
          api.getButcheryOrders(),
          api.getButchers(),
        ]);
        setInventory(inventoryRes.data);
        setOrders(ordersRes.data);
        setButchers(butchersRes.data);
      } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab}
      style={[localStyles.tabButton, activeTab === tab && localStyles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[localStyles.tabText, activeTab === tab && { color: '#fff' }]}>{tab}</Text>
    </TouchableOpacity>
  );

  const MeatCard = ({ item }) => (
    <InfoCard
      icon="restaurant-outline"
      title={item.meatType}
      value={`${item.quantity} kg @ KES ${item.pricePerKg}/kg`}
    />
  );

  const renderInventory = () => (
    <FlatList
      data={inventory}
      renderItem={({ item }) => <MeatCard item={item} />}
      keyExtractor={(item, index) => index.toString()}
    />
  );

  const renderOrders = () => (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <InfoCard
          icon="receipt-outline"
          title={`From: ${item.butcherName}`}
          value={`Meat: ${item.meatType} | Status: ${item.status}`}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );

  const renderButchers = () => (
    <FlatList
      data={butchers}
      renderItem={({ item }) => (
        <InfoCard
          icon="person-outline"
          title={item.name}
          value={`Contact: ${item.contact}`}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Inventory':
        return renderInventory();
      case 'Orders':
        return renderOrders();
      case 'Butchers':
        return renderButchers();
      default:
        return (
          <View style={{ paddingTop: 10 }}>
            <InfoCard icon="cube-outline" title="Meat in Stock" value={`${inventory.reduce((sum, i) => sum + i.quantity, 0)} kg`} />
            <InfoCard icon="cart-outline" title="Orders Pending" value={`${orders.length}`} />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.header}>
        <Text style={localStyles.greeting}>👋 Welcome, Slaughterhouse Agent</Text>
        <Ionicons name="person-circle-outline" size={28} color="#333" />
      </View>
      <View style={localStyles.tabContainer}>{TABS.map(renderTabButton)}</View>
      <View style={globalStyles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fdf5f3',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins_600SemiBold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff3e0',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#d32f2f',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins_400Regular',
  },
  image: {
    height: 120,
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default AgentDashboard;

