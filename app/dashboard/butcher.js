import React, { useEffect, useState } from 'react';
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
import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png.jpeg';
import pork from '../../assets/images/pork.jpeg';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';


const meatImages = {
  beef: beef,
  goat: goat,
  chicken: chicken,
  pork: pork,
  lamb: lamb,
  default: meatDefault,
};

const TABS = ['Inventory', 'Customer Orders', 'Purchase', 'Profile'];

const ButcherDashboard = ({ userName }) => {
  const [activeTab, setActiveTab] = useState('Inventory');

  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableMeat, setAvailableMeat] = useState([]);
  const [slaughterOrders, setSlaughterOrders] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ meatType: '', price: '', stock: '' });
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedMeatToOrder, setSelectedMeatToOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const ORDER_STATUS_OPTIONS = ['pending', 'processing', 'ready', 'delivered'];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [invRes, custOrdersRes, availMeatRes, shOrdersRes] = await Promise.all([
        api.getButcherInventory(),
        api.getCustomerOrdersForButcher(),
        api.getAvailableMeatForPurchase(),
        api.getSlaughterhouseOrders(),
      ]);

      // --- START DEBUG LOGS ---
      console.log('DEBUG: Butcher Inventory Response Data:', invRes.data);
      console.log('DEBUG: Customer Orders Response Data:', custOrdersRes.data);
      console.log('DEBUG: Available Meat Response Data:', availMeatRes.data);
      console.log('DEBUG: Slaughterhouse Orders Response Data:', shOrdersRes.data);
      // --- END DEBUG LOGS ---

      setInventory(Array.isArray(invRes.data?.inventory) ? invRes.data.inventory : []);
      setOrders(Array.isArray(custOrdersRes.data?.orders) ? custOrdersRes.data.orders : []);
      setAvailableMeat(Array.isArray(availMeatRes.data) ? availMeatRes.data : []);
      setSlaughterOrders(Array.isArray(shOrdersRes.data?.orders) ? shOrdersRes.data.orders : []);

    } catch (err) {
      console.error('❌ Load error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.meatType || !newItem.price || !newItem.stock) {
      return Alert.alert('Validation Error', 'Please fill all fields to add item.');
    }
    try {
      await api.addInventoryItem({
        meatType: newItem.meatType,
        price: parseFloat(newItem.price),
        stock: parseFloat(newItem.stock),
      });
      setNewItem({ meatType: '', price: '', stock: '' });
      setShowAddModal(false);
      fetchAll();
    } catch (err) {
      Alert.alert('Add Item Error', err.response?.data?.message || err.message || 'Could not add item.');
      console.error('Add item error:', err.response?.data || err.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem || !currentItem._id || !currentItem.meatType || !currentItem.price || !currentItem.stock) {
      return Alert.alert('Validation Error', 'Invalid item data for update.');
    }
    try {
      await api.updateInventoryItem(currentItem._id, {
        meatType: currentItem.meatType,
        price: parseFloat(currentItem.price),
        stock: parseFloat(currentItem.stock),
      });
      setShowUpdateItemModal(false);
      setCurrentItem(null);
      fetchAll();
    } catch (err) {
      Alert.alert('Update Item Error', err.response?.data?.message || err.message || 'Could not update item.');
      console.error('Update item error:', err.response?.data || err.message);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!currentOrder || !newOrderStatus) {
      return Alert.alert('Validation Error', 'Please select a status.');
    }
    try {
      await api.updateOrderStatus(currentOrder._id, newOrderStatus);
      setShowUpdateOrderModal(false);
      setCurrentOrder(null);
      setNewOrderStatus('');
      fetchAll();
    } catch (err) {
      Alert.alert('Update Order Error', err.response?.data?.message || err.message || 'Could not update order status.');
      console.error('Update order status error:', err.response?.data || err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedMeatToOrder || !orderQuantity || isNaN(parseFloat(orderQuantity)) || parseFloat(orderQuantity) <= 0) {
      return Alert.alert('Validation Error', 'Please enter a valid quantity.');
    }
    try {
      await api.orderFromSlaughterhouse(selectedMeatToOrder._id, parseFloat(orderQuantity));
      setShowPlaceOrderModal(false);
      setSelectedMeatToOrder(null);
      setOrderQuantity('');
      fetchAll();
    } catch (err) {
      Alert.alert('Place Order Error', err.response?.data?.message || err.message || 'Could not place order with slaughterhouse.');
      console.error('Place order error:', err.response?.data || err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert("Logged Out", "You have been successfully logged out.");
      // Add navigation to login screen here if using React Navigation or Expo Router
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

  const renderInventory = () => (
    <>
      <TouchableOpacity style={globalStyles.button} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={globalStyles.buttonText}>Add New Item</Text>
      </TouchableOpacity>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={inventory}
          renderItem={({ item }) => {
            // Guard against null/undefined item
            if (!item || !item._id) {
              console.warn("Skipping malformed inventory item:", item);
              return null;
            }
            return (
              <InfoCard
                title={String(item.meatType)}
                value={`Stock: ${String(item.stock)}kg @ KES ${String(item.price)}/kg`}
                imageSource={getMeatImage(item.meatType)}
              >
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[globalStyles.buttonOutline, styles.smallActionButton]}
                    onPress={() => {
                      setCurrentItem({
                          _id: item._id,
                          meatType: String(item.meatType),
                          price: String(item.price),
                          stock: String(item.stock)
                      });
                      setShowUpdateItemModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                    <Text style={globalStyles.buttonOutlineText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </InfoCard>
            );
          }}
          keyExtractor={(item) => item._id ? String(item._id) : Math.random().toString()} // Robust key
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
          ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
        />
      )}
    </>
  );

  const renderCustomerOrders = () => (
    loading && !refreshing ? (
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
    ) : (
      <FlatList
        data={orders}
        renderItem={({ item }) => {
          if (!item || !item._id) {
            console.warn("Skipping malformed customer order item:", item);
            return null;
          }
          return (
            <InfoCard
              icon="receipt-outline"
              title={`Customer: ${String(item.customerName || 'N/A')}`}
              value={`Total: KES ${String(item.total || 0)}`}
              subtitle={`Status: ${String(item.status)} | Items: ${
                // Robustly check if item.items is an array before mapping
                Array.isArray(item.items)
                  ? item.items.map(i => `${i.quantity}kg ${i.meatType}`).join(', ')
                  : 'N/A'
              }`}
            >
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    styles.smallActionButton,
                    { backgroundColor: item.status === 'delivered' ? COLORS.success : COLORS.warning }
                  ]}
                  onPress={() => {
                    setCurrentOrder(item);
                    setNewOrderStatus(String(item.status));
                    setShowUpdateOrderModal(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={16} color="#fff" />
                  <Text style={globalStyles.buttonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </InfoCard>
          );
        }}
        keyExtractor={(item) => item._id ? String(item._id) : Math.random().toString()} // Robust key
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
        ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No customer orders found.</Text>}
      />
    )
  );

  const renderPurchase = () => (
    <View style={styles.purchaseTabContainer}>
      <Text style={globalStyles.sectionHeader}>Available Meat from Slaughterhouses</Text>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={availableMeat}
          renderItem={({ item }) => {
            // Guard against null/undefined item
            if (!item || !item._id) {
              console.warn("Skipping malformed available meat item:", item);
              return null;
            }
            return (
              <InfoCard
                icon="cube-outline"
                title={String(item.meatType)}
                value={`KES ${String(item.pricePerKg)}/kg | Stock: ${String(item.quantity)}kg`}
                subtitle={`From: ${String(item.slaughterhouseName)}`}
                imageSource={getMeatImage(item.meatType)}
              >
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[globalStyles.button, styles.smallActionButton]}
                    onPress={() => {
                      setSelectedMeatToOrder(item);
                      setShowPlaceOrderModal(true);
                    }}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={globalStyles.buttonText}>Order</Text>
                  </TouchableOpacity>
                </View>
              </InfoCard>
            );
          }}
          keyExtractor={(item) => item._id ? String(item._id) : Math.random().toString()} // Robust key
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
          ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available for purchase.</Text>}
        />
      )}

      <Text style={[globalStyles.sectionHeader, { marginTop: 20 }]}>Your Slaughterhouse Orders</Text>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={slaughterOrders}
          renderItem={({ item }) => {
            // Guard against null/undefined item
            if (!item || !item._id) {
              console.warn("Skipping malformed slaughter order item:", item);
              return null;
            }
            return (
              <InfoCard
                icon="swap-horizontal-outline"
                title={`Order for ${String(item.meatType || item.animalType || 'N/A')}`}
                value={`Quantity: ${String(item.quantity)}kg`}
                subtitle={`Status: ${String(item.status)} | From: ${String(item.slaughterhouseName || 'N/A')}`}
              />
            );
          }}
          keyExtractor={(item) => item._id ? String(item._id) : Math.random().toString()} // Robust key
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
          ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No orders placed with slaughterhouses.</Text>}
        />
      )}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <Ionicons name="person-circle-outline" size={80} color={COLORS.textDark} />
      <Text style={styles.profileName}>{String(userName || 'Butcher User')}</Text>
      <Text style={styles.profileRole}>Role: Butcher</Text>
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
      case 'Inventory':
        return renderInventory();
      case 'Customer Orders':
        return renderCustomerOrders();
      case 'Purchase':
        return renderPurchase();
      case 'Profile':
        return renderProfile();
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
          tab === 'Inventory' ? 'cube-outline' :
          tab === 'Customer Orders' ? 'receipt-outline' :
          tab === 'Purchase' ? 'cart-outline' :
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
      <View style={styles.header}>
        <Text style={styles.greeting}>👋 Welcome, {String(userName || 'Butcher')}</Text>
        <Ionicons name="business-outline" size={28} color={COLORS.textDark} />
      </View>

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      <View style={globalStyles.bottomTabBar}>
        {TABS.map(renderTabButton)}
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Inventory Item</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat, Chicken, Pork, Lamb)"
              value={newItem.meatType}
              onChangeText={(text) => setNewItem({ ...newItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              keyboardType="numeric"
              value={String(newItem.price)}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Stock (Kg)"
              keyboardType="numeric"
              value={String(newItem.stock)}
              onChangeText={(text) => setNewItem({ ...newItem, stock: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, styles.modalButton]} onPress={() => setShowAddModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, styles.modalButton]} onPress={handleAddItem}>
                <Text style={globalStyles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Item Modal */}
      <Modal visible={showUpdateItemModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Inventory Item</Text>
            {currentItem && (
              <>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Meat Type"
                  value={String(currentItem.meatType)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, meatType: text })}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Price per Kg"
                  keyboardType="numeric"
                  value={String(currentItem.price)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem.price, price: text })}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Stock (Kg)"
                  keyboardType="numeric"
                  value={String(currentItem.stock)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, stock: text })}
                />
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, styles.modalButton]} onPress={() => setShowUpdateItemModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, styles.modalButton]} onPress={handleUpdateItem}>
                <Text style={globalStyles.buttonText}>Update Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Customer Order Status Modal */}
      <Modal visible={showUpdateOrderModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            {currentOrder && (
              <Text style={styles.modalSubtitle}>Order ID: {String(currentOrder._id)}</Text>
            )}
            <TextInput
              style={globalStyles.input}
              placeholder="New Status (e.g., pending, processing, ready, delivered)"
              value={newOrderStatus}
              onChangeText={setNewOrderStatus}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, styles.modalButton]} onPress={() => setShowUpdateOrderModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, styles.modalButton]} onPress={handleUpdateOrderStatus}>
                <Text style={globalStyles.buttonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Place Order with Slaughterhouse Modal */}
      <Modal visible={showPlaceOrderModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Meat from Slaughterhouse</Text>
            {selectedMeatToOrder && (
              <Text style={styles.modalSubtitle}>Ordering: {String(selectedMeatToOrder.meatType)} ({String(selectedMeatToOrder.quantity)}kg available)</Text>
            )}
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (Kg)"
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, styles.modalButton]} onPress={() => setShowPlaceOrderModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, styles.modalButton]} onPress={handlePlaceOrder}>
                <Text style={globalStyles.buttonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyState: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textLight,
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
  purchaseTabContainer: {
    flex: 1,
  }
});

export default ButcherDashboard;
