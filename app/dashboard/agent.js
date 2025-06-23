import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';
import globalStyles from '../styles/globalStyles';
import COLORS from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import InfoCard from '../../components/InfoCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png.jpeg';
import pork from '../../assets/images/pork.jpeg';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

// Map imported image variables to their keys
const meatImages = {
  beef: beef,
  goat: goat,
  chicken: chicken,
  pork: pork,
  lamb: lamb,
  default: meatDefault,
};

const TABS = ['Home', 'Inventory', 'Orders', 'Butchers', 'Purchases'];

const AgentDashboard = ({ userName }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]); // Orders from butchers (now using Purchases)
  const [butchers, setButchers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]); // Agent's own orders from other slaughterhouses

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    meatType: '',
    quantity: '',
    pricePerKg: '',
    slaughterhouseName: userName || '',
    isPublic: false,
  });

  useEffect(() => {
    if (userName && newInventoryItem.slaughterhouseName !== userName) {
      setNewInventoryItem(prev => ({ ...prev, slaughterhouseName: userName }));
    }
    fetchAllData();
  }, [userName]);

  const fetchAllData = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [inventoryRes, ordersRes, butchersRes, purchaseOrdersRes] = await Promise.all([
        api.getSlaughterhouseInventory(),
        api.getButcheryOrders(), // This now fetches formatted Purchase data
        api.getButchers(),
        api.getMyPurchaseOrders(),
      ]);

      console.log('DEBUG (Frontend - Agent): Raw inventoryRes.data:', inventoryRes.data);
      console.log('DEBUG (Frontend - Agent): Raw ordersRes.data (Butchery Orders):', ordersRes.data); // CRITICAL LOG
      console.log('DEBUG (Frontend - Agent): Raw butchersRes.data:', butchersRes.data);
      console.log('DEBUG (Frontend - Agent): Raw purchaseOrdersRes.data (My Purchases):', purchaseOrdersRes.data);


      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []); // Ensure this is an array
      setButchers(Array.isArray(butchersRes.data?.butchers) ? butchersRes.data.butchers : []);
      setPurchaseOrders(Array.isArray(purchaseOrdersRes.data) ? purchaseOrdersRes.data : []);

    } catch (error) {
      console.error('❌ Agent Dashboard Load Error:', error.response?.status, error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleAddInventoryItem = async () => {
    if (!newInventoryItem.meatType || !newInventoryItem.quantity || !newInventoryItem.pricePerKg) {
      return Alert.alert('Validation Error', 'Please fill all required fields: Meat Type, Quantity, and Price.');
    }

    if (!newInventoryItem.slaughterhouseName) {
        return Alert.alert('Error', 'Slaughterhouse name is missing. Please ensure your user profile is complete.');
    }

    try {
      await api.addSlaughterhouseInventory({
        meatType: newInventoryItem.meatType,
        quantity: parseFloat(newInventoryItem.quantity),
        pricePerKg: parseFloat(newInventoryItem.pricePerKg),
        slaughterhouseName: newInventoryItem.slaughterhouseName,
        isPublic: newInventoryItem.isPublic,
      });
      setNewInventoryItem(prev => ({ ...prev, meatType: '', quantity: '', pricePerKg: '', isPublic: false }));
      setShowAddInventoryModal(false);
      fetchAllData();
      Alert.alert('Success', 'Inventory item added successfully!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add inventory item.');
      console.error('Add Inventory Error:', error.response?.data || error.message);
    }
  };

  const getMeatImage = (meatType) => {
    const lowerMeatType = (meatType || '').toLowerCase();
    if (meatImages[lowerMeatType]) {
      return meatImages[lowerMeatType];
    }
    return meatImages.default;
  };

  const renderHome = () => (
    <View style={globalStyles.content}>
      <InfoCard
        icon="cube-outline"
        title="Total Meat in Stock"
        value={`${String(inventory.reduce((sum, i) => sum + i.quantity, 0))} kg`}
      />
      <InfoCard
        icon="receipt-outline"
        title="Pending Butchery Orders"
        value={`${String(orders.filter(order => order.status === 'pending').length)}`}
      />
      <InfoCard
        icon="people-outline"
        title="Registered Butchers"
        value={String(butchers.length)}
      />
      <InfoCard
        icon="swap-horizontal-outline"
        title="My Purchase Orders (Agent)"
        value={String(purchaseOrders.length)}
      />
    </View>
  );

  const renderInventoryTab = () => (
    <>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => setShowAddInventoryModal(true)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={globalStyles.buttonText}>Add New Meat</Text>
      </TouchableOpacity>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
      ) : (
        <FlatList
          data={inventory}
          renderItem={({ item }) => (
            <InfoCard
              title={String(item.meatType)}
              value={`Stock: ${String(item.quantity)}kg @ KES ${String(item.pricePerKg)}/kg`}
              subtitle={`Slaughterhouse: ${String(item.slaughterhouseName)} | Public: ${item.isPublic ? 'Yes' : 'No'}`}
              imageSource={getMeatImage(item.meatType)}
            >
              {/* Add edit/delete actions if needed for inventory items */}
            </InfoCard>
          )}
          keyExtractor={(item) => String(item._id || item.meatType + item.slaughterhouseName)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
          ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
        />
      )}
    </>
  );

  const renderOrdersTab = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
    ) : (
      <FlatList
        data={orders} // This 'orders' state now holds formatted Purchase data
        renderItem={({ item }) => {
          // --- START DEBUG LOG ---
          console.log('DEBUG (Frontend - Agent Orders Tab): Rendering item:', item);
          // --- END DEBUG LOG ---

          // Ensure item and its properties are valid before rendering
          if (!item || !item._id) {
            console.warn("Skipping malformed order item in Agent Orders tab:", item);
            return null;
          }

          return (
            <InfoCard
              icon="receipt-outline"
              title={`Order from: ${String(item.butcherName || 'N/A')}`}
              value={`Meat: ${String(item.meatType || 'undefined')} | Quantity: ${String(item.quantity || '0')}kg`}
              subtitle={`Status: ${String(item.status || 'N/A')} | Ordered: ${new Date(item.createdAt).toLocaleDateString()}`}
            >
              {/* Add action buttons for processing/updating order status if applicable for agent */}
            </InfoCard>
          );
        }}
        keyExtractor={(item) => String(item._id || item.buyerId + item.createdAt || Math.random().toString())}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No butcher purchase orders found for your slaughterhouse.</Text>}
      />
    )
  );

  const renderButchersTab = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
    ) : (
      <FlatList
        data={butchers}
        renderItem={({ item }) => (
          <InfoCard
            icon="person-outline"
            title={String(item.name)}
            value={`Email: ${String(item.email)}`}
            subtitle={`Role: ${String(item.role)}`}
          >
            {/* Add more butcher details or actions if needed */}
          </InfoCard>
        )}
        keyExtractor={(item) => String(item._id || item.email)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No registered butchers found.</Text>}
      />
    )
  );

  const renderAgentPurchasesTab = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
    ) : (
      <FlatList
        data={purchaseOrders}
        renderItem={({ item }) => (
          <InfoCard
            icon="swap-horizontal-outline"
            title={`Purchase of: ${String(item.meatType || 'N/A')}`}
            value={`Quantity: ${String(item.quantity)}kg`}
            subtitle={`Status: ${String(item.status)} | From: ${String(item.slaughterhouseName || 'N/A')}`}
          />
        )}
        keyExtractor={(item) => String(item._id || item.meatId + item.createdAt)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No purchase orders found.</Text>}
      />
    )
  );


  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={globalStyles.loadingText}>Loading dashboard data...</Text>
        </View>
      );
    }
    switch (activeTab) {
      case 'Home':
        return renderHome();
      case 'Inventory':
        return renderInventoryTab();
      case 'Orders':
        return renderOrdersTab();
      case 'Butchers':
        return renderButchersTab();
      case 'Purchases':
        return renderAgentPurchasesTab();
      default:
        return <Text style={globalStyles.emptyStateText}>Select a tab to view content.</Text>;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab}
      style={[globalStyles.tabButton, activeTab === tab && globalStyles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={
          tab === 'Home' ? 'home-outline' :
          tab === 'Inventory' ? 'cube-outline' :
          tab === 'Orders' ? 'receipt-outline' :
          tab === 'Butchers' ? 'people-outline' :
          tab === 'Purchases' ? 'swap-horizontal' :
          'help-circle-outline'
        }
        size={20}
        color={activeTab === tab ? '#fff' : COLORS.textLight}
      />
      <Text style={[globalStyles.tabText, activeTab === tab && globalStyles.activeTabText]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.header}>
        <Text style={localStyles.greeting}>👋 Welcome, {String(userName || 'Slaughterhouse Agent')}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <View style={localStyles.contentContainer}>
        {renderContent()}
      </View>

      <View style={globalStyles.bottomTabBar}>
        {TABS.map(renderTabButton)}
      </View>

      {/* Add Inventory Modal */}
      <Modal visible={showAddInventoryModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Meat to Inventory</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat)"
              value={newInventoryItem.meatType}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (in kg)"
              keyboardType="numeric"
              value={newInventoryItem.quantity}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, quantity: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              keyboardType="numeric"
              value={newInventoryItem.pricePerKg}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, pricePerKg: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Slaughterhouse Name"
              value={newInventoryItem.slaughterhouseName}
              editable={false}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, slaughterhouseName: text })}
            />
            <View style={localStyles.checkboxContainer}>
              <TouchableOpacity
                style={localStyles.checkbox}
                onPress={() => setNewInventoryItem({ ...newInventoryItem, isPublic: !newInventoryItem.isPublic })}
              >
                <Ionicons
                  name={newInventoryItem.isPublic ? 'checkbox-outline' : 'square-outline'}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={localStyles.checkboxLabel}>Make Publicly Available (for Butchers)</Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, localStyles.modalButton]}
                onPress={() => setShowAddInventoryModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, localStyles.modalButton]}
                onPress={handleAddInventoryItem}
              >
                <Text style={globalStyles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.bg,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textDark,
  },
});

export default AgentDashboard;
