import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles';
import InfoCard from '../../components/InfoCard'; 
import api from '../api'; 
import COLORS from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Image imports - ensure these paths are correct relative to THIS FILE
import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png.jpeg';
import pork from '../../assets/images/pork.jpeg';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

// Map imported image variables to their keys for easy lookup
const meatImages = {
  beef: beef,
  goat: goat,
  chicken: chicken,
  pork: pork,
  lamb: lamb,
  default: meatDefault,
};

const TABS = ['Browse Meat', 'My Orders', 'Profile'];

const CustomerDashboard = ({ userName }) => {
  const [activeTab, setActiveTab] = useState('Browse Meat');
  const [availableMeat, setAvailableMeat] = useState([]); // Meat from butchers
  const [myOrders, setMyOrders] = useState([]); // Customer's own placed orders

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for placing a new order modal
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedMeatToOrder, setSelectedMeatToOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [availableMeatRes, myOrdersRes] = await Promise.all([
        api.getAvailableMeatForCustomers(),
        api.getMyCustomerOrders(),
      ]);

      // Ensure data is array before setting state
      setAvailableMeat(Array.isArray(availableMeatRes.data) ? availableMeatRes.data : []);
      setMyOrders(Array.isArray(myOrdersRes.data) ? myOrdersRes.data : []);

    } catch (error) {
      console.error('❌ Customer Dashboard Load Error:', error.response?.status, error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedMeatToOrder || !orderQuantity || isNaN(parseFloat(orderQuantity)) || parseFloat(orderQuantity) <= 0) {
      return Alert.alert('Validation Error', 'Please enter a valid quantity.');
    }

    // Check if the requested quantity exceeds available stock
    if (parseFloat(orderQuantity) > selectedMeatToOrder.quantity) {
      return Alert.alert('Order Failed', `Requested quantity (${orderQuantity}kg) exceeds available stock (${selectedMeatToOrder.quantity}kg).`);
    }

    try {
      await api.placeCustomerOrder(selectedMeatToOrder._id, parseFloat(orderQuantity));
      setShowPlaceOrderModal(false);
      setSelectedMeatToOrder(null);
      setOrderQuantity('');
      fetchAllData(); // Refresh data after successful order
      Alert.alert('Success', 'Your order has been placed successfully!');
    } catch (error) {
      Alert.alert('Order Error', error.response?.data?.message || 'Failed to place order.');
      console.error('Place order error:', error.response?.data || error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert("Logged Out", "You have been successfully logged out.");

    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  const getMeatImage = (meatType) => {
    const lowerMeatType = (meatType || '').toLowerCase();
    if (meatImages[lowerMeatType]) {
      return meatImages[lowerMeatType];
    }
    return meatImages.default;
  };

  const renderBrowseMeatTab = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
    ) : (
      <FlatList
        data={availableMeat}
        renderItem={({ item }) => {
          if (!item || !item._id) {
            console.warn("Skipping malformed available meat item:", item);
            return null;
          }
          return (
            <InfoCard
              icon="cut-outline" 
              title={String(item.meatType)}
              value={`KES ${String(item.pricePerKg)}/kg | Stock: ${String(item.quantity)}kg`}
              subtitle={`From: ${String(item.butcheryName || 'N/A')}`} 
              imageSource={getMeatImage(item.meatType)}
            >
              <View style={localStyles.cardActions}>
                <TouchableOpacity
                  style={[globalStyles.button, localStyles.smallActionButton]}
                  onPress={() => {
                    setSelectedMeatToOrder(item);
                    setShowPlaceOrderModal(true);
                  }}
                >
                  <Ionicons name="cart-outline" size={16} color="#fff" />
                  <Text style={globalStyles.buttonText}>Place Order</Text>
                </TouchableOpacity>
              </View>
            </InfoCard>
          );
        }}
        keyExtractor={(item) => String(item._id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available from butchers.</Text>}
      />
    )
  );

  const renderMyOrdersTab = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
    ) : (
      <FlatList
        data={myOrders}
        renderItem={({ item }) => {
          if (!item || !item._id) {
            console.warn("Skipping malformed order item:", item);
            return null;
          }
          return (
            <InfoCard
              icon="receipt-outline"
              title={`Order for ${String(item.meatType)}`}
              value={`Quantity: ${String(item.quantity)}kg | Total: KES ${String(item.totalPrice)}`}
              subtitle={`Status: ${String(item.status)} | From: ${String(item.butcheryName || 'N/A')} (Contact: ${String(item.butcherContact || 'N/A')})`}
            />
          );
        }}
        keyExtractor={(item) => String(item._id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAllData} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>You have no past orders.</Text>}
      />
    )
  );

  const renderProfileTab = () => (
    <View style={localStyles.profileContainer}>
      <Ionicons name="person-circle-outline" size={80} color={COLORS.textDark} />
      <Text style={localStyles.profileName}>{String(userName || 'Customer User')}</Text>
      <Text style={localStyles.profileRole}>Role: Customer</Text>
      <TouchableOpacity style={globalStyles.buttonOutline} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
        <Text style={globalStyles.buttonOutlineText}>Logout</Text>
      </TouchableOpacity>
    </View>
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
      case 'Browse Meat':
        return renderBrowseMeatTab();
      case 'My Orders':
        return renderMyOrdersTab();
      case 'Profile':
        return renderProfileTab();
      default:
        return null;
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
          tab === 'Browse Meat' ? 'basket-outline' :
          tab === 'My Orders' ? 'list-outline' :
          'person-outline'
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
        <Text style={localStyles.greeting}>👋 Welcome, {String(userName || 'Customer')}</Text>
        <Ionicons name="person-circle-outline" size={28} color={COLORS.textDark} />
      </View>

      <View style={localStyles.contentContainer}>
        {renderContent()}
      </View>

      <View style={globalStyles.bottomTabBar}>
        {TABS.map(renderTabButton)}
      </View>

      {/* Place Order Modal */}
      <Modal visible={showPlaceOrderModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Place Your Order</Text>
            {selectedMeatToOrder && (
              <Text style={localStyles.modalSubtitle}>Ordering: {String(selectedMeatToOrder.meatType)} from {String(selectedMeatToOrder.butcheryName)}</Text>
            )}
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (Kg)"
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />
            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowPlaceOrderModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handlePlaceOrder}>
                <Text style={globalStyles.buttonText}>Confirm Order</Text>
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  smallActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 90,
    justifyContent: 'center',
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
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 10,
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
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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

export default CustomerDashboard;
