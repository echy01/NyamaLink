import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';    
import api from '../api';                        
import COLORS from '../styles/colors';             

const ButcherCustomerOrdersScreen = () => {
  const [orders, setOrders] = useState([]); 
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Customer Order Management Modal
  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');

  const ORDER_STATUS_OPTIONS = ['pending', 'processing', 'ready', 'delivered', 'cancelled']; 

  const fetchCustomerOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const custOrdersRes = await api.getCustomerOrdersForButcher();
      setOrders(Array.isArray(custOrdersRes.data?.orders) ? custOrdersRes.data.orders : []);
    } catch (err) {
      console.error('❌ Butcher Customer Orders Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load customer orders. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerOrders(); 
  }, [fetchCustomerOrders]);

  const handleUpdateOrderStatus = async () => {
    if (!currentOrder || !newOrderStatus) {
      return Alert.alert('Validation Error', 'Please select an order and status.');
    }
    if (!ORDER_STATUS_OPTIONS.includes(newOrderStatus)) {
        return Alert.alert('Invalid Status', 'Please select a valid status: ' + ORDER_STATUS_OPTIONS.join(', '));
    }
    try {
      await api.updateOrderStatus(currentOrder._id, newOrderStatus);
      setShowUpdateOrderModal(false);
      setCurrentOrder(null);
      setNewOrderStatus('');
      fetchCustomerOrders(); 
      Alert.alert('Success', 'Order status updated successfully!');
    } catch (err) {
      Alert.alert('Update Order Error', err.response?.data?.message || err.message || 'Could not update order status.');
      console.error('Update order status error:', err.response?.data || err.message);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
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
                  value={`Order for: ${String(item.meatType || 'N/A')} | Quantity: ${String(item.quantity || '0')}kg`}
                  subtitle={`Status: ${String(item.status || 'N/A')} | Total: KES ${String(item.totalPrice || '0')} | Placed: ${new Date(item.createdAt).toLocaleDateString()}`}
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[
                        globalStyles.button,
                        localStyles.smallActionButton,
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
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCustomerOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No customer orders found.</Text>}
          />
        )}
      </View>

      {/* Update Customer Order Status Modal */}
      <Modal visible={showUpdateOrderModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Order Status</Text>
            {currentOrder && (
              <Text style={localStyles.modalSubtitle}>Order for {String(currentOrder.customerName || 'N/A')} ({String(currentOrder.meatType || 'N/A')})</Text>
            )}
            {/* Using a TextInput for status update, could be replaced by a Picker for better UX */}
            <TextInput
              style={globalStyles.input}
              placeholder="New Status (e.g., processing, ready, delivered, cancelled)"
              value={newOrderStatus}
              onChangeText={setNewOrderStatus}
            />
            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowUpdateOrderModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handleUpdateOrderStatus}>
                <Text style={globalStyles.buttonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0, 
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
});

export default ButcherCustomerOrdersScreen;
