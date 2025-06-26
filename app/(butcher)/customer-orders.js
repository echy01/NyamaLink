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
import { Picker } from '@react-native-picker/picker';
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
  // Dispatch details for customer order
  const [customerOrderTrackingNumber, setCustomerOrderTrackingNumber] = useState('');
  const [customerOrderCarrier, setCustomerOrderCarrier] = useState('');
  const [customerOrderEstimatedDeliveryDate, setCustomerOrderEstimatedDeliveryDate] = useState(''); 
  // Delivery confirmation for customer order
  const [customerOrderReceivedBy, setCustomerOrderReceivedBy] = useState('');

  // Define allowed order statuses for the butcher to choose from
  const CUSTOMER_ORDER_STATUS_OPTIONS = ['pending', 'accepted', 'processing', 'ready_for_pickup', 'dispatched', 'arrived', 'completed', 'cancelled']; 

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
    if (!CUSTOMER_ORDER_STATUS_OPTIONS.includes(newOrderStatus)) {
        return Alert.alert('Invalid Status', 'Please select a valid status: ' + CUSTOMER_ORDER_STATUS_OPTIONS.join(', '));
    }

    const dispatchDetails = {};
    const deliveryConfirmation = {};

    // Collect dispatch details if status implies dispatch
    if (newOrderStatus === 'dispatched' || newOrderStatus === 'arrived' || newOrderStatus === 'completed') {
      if (!customerOrderTrackingNumber || !customerOrderCarrier || !customerOrderEstimatedDeliveryDate) {
        return Alert.alert('Validation Error', 'Tracking number, carrier, and estimated delivery date are required for dispatched/arrived/completed status.');
      }
      dispatchDetails.trackingNumber = customerOrderTrackingNumber;
      dispatchDetails.carrier = customerOrderCarrier;
      dispatchDetails.estimatedDeliveryDate = new Date(customerOrderEstimatedDeliveryDate).toISOString(); 
    }

    // Collect delivery confirmation if status implies delivery
    if (newOrderStatus === 'arrived' || newOrderStatus === 'completed') {
      if (!customerOrderReceivedBy) {
        return Alert.alert('Validation Error', 'Received by is required for arrived/completed status.');
      }
      deliveryConfirmation.receivedBy = customerOrderReceivedBy;
    }

    try {
      await api.updateCustomerOrderStatus(
        currentOrder._id,
        newOrderStatus,
        Object.keys(dispatchDetails).length > 0 ? dispatchDetails : undefined, 
        Object.keys(deliveryConfirmation).length > 0 ? deliveryConfirmation : undefined
      );
      setShowUpdateOrderModal(false);
      setCurrentOrder(null);
      setNewOrderStatus('');
      // Clear dispatch/delivery states after successful update
      setCustomerOrderTrackingNumber('');
      setCustomerOrderCarrier('');
      setCustomerOrderEstimatedDeliveryDate('');
      setCustomerOrderReceivedBy('');
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
                  subtitle={
                    [
                        `Status: ${item.status || 'N/A'}`,
                        item.dispatchDetails?.trackingNumber ? `Tracking: ${item.dispatchDetails.trackingNumber}` : null,
                        item.dispatchDetails?.carrier ? `Carrier: ${item.dispatchDetails.carrier}` : null,
                        item.dispatchDetails?.estimatedDeliveryDate
                        ? `Est. Delivery: ${new Date(item.dispatchDetails.estimatedDeliveryDate).toLocaleDateString()}`
                        : null,
                        item.deliveryConfirmation?.receivedBy ? `Received By: ${item.deliveryConfirmation.receivedBy}` : null,
                        item.deliveryConfirmation?.receivedDate
                        ? `Received On: ${new Date(item.deliveryConfirmation.receivedDate).toLocaleDateString()}`
                        : null,
                        `Total: KES ${item.totalPrice || '0'}`,
                        `Placed: ${new Date(item.createdAt).toLocaleDateString()}`,
                    ]
                        .filter(Boolean)
                        .join(' | ')
                    }
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[
                        globalStyles.button,
                        localStyles.smallActionButton,
                        { backgroundColor: item.status === 'completed' ? COLORS.success : COLORS.warning } // Use 'completed'
                      ]}
                      onPress={() => {
                        setCurrentOrder(item);
                        setNewOrderStatus(String(item.status)); 
                        // Populate existing dispatch/delivery details if available
                        setCustomerOrderTrackingNumber(item.dispatchDetails?.trackingNumber || '');
                        setCustomerOrderCarrier(item.dispatchDetails?.carrier || '');
                        setCustomerOrderEstimatedDeliveryDate(item.dispatchDetails?.estimatedDeliveryDate ? new Date(item.dispatchDetails.estimatedDeliveryDate).toISOString().split('T')[0] : ''); // Format to YYYY-MM-DD
                        setCustomerOrderReceivedBy(item.deliveryConfirmation?.receivedBy || '');
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
            <Text style={localStyles.modalTitle}>Update Customer Order Status</Text>
            {currentOrder && (
              <Text style={localStyles.modalSubtitle}>Order for {String(currentOrder.customerName || 'N/A')} ({String(currentOrder.meatType || 'N/A')})</Text>
            )}
            <View style={[globalStyles.input, { padding: 0 }]}>
            <Picker
                selectedValue={newOrderStatus}
                onValueChange={(itemValue) => setNewOrderStatus(itemValue)}
                style={{ height: 50 }}
            >
                <Picker.Item label="Select Status" value="" enabled={false} />
                {CUSTOMER_ORDER_STATUS_OPTIONS.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
                ))}
            </Picker>
            </View>

            {/* Conditional Inputs for Dispatch Details */}
            {(newOrderStatus === 'dispatched' || newOrderStatus === 'arrived' || newOrderStatus === 'completed') && (
              <>
                <Text style={localStyles.sectionHeaderSmall}>Dispatch Details:</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Tracking Number (Optional)"
                  placeholderTextColor={COLORS.textLight}
                  value={customerOrderTrackingNumber}
                  onChangeText={setCustomerOrderTrackingNumber}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Carrier (e.g., In-house, G4S)"
                  placeholderTextColor={COLORS.textLight}
                  value={customerOrderCarrier}
                  onChangeText={setCustomerOrderCarrier}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Estimated Delivery Date (YYYY-MM-DD)"
                  placeholderTextColor={COLORS.textLight}
                  value={customerOrderEstimatedDeliveryDate}
                  onChangeText={setCustomerOrderEstimatedDeliveryDate}
                  keyboardType="numeric" // Use date picker in real app
                />
              </>
            )}

            {/* Conditional Inputs for Delivery Confirmation */}
            {(newOrderStatus === 'arrived' || newOrderStatus === 'completed') && (
              <>
                <Text style={localStyles.sectionHeaderSmall}>Delivery Confirmation:</Text>
                <View style={[globalStyles.input, { paddingHorizontal: 10 }]}>
                <Text style={{ color: COLORS.textDark, marginBottom: 5 }}>Select New Status</Text>
                {CUSTOMER_ORDER_STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                    key={status}
                    onPress={() => setNewOrderStatus(status)}
                    style={{
                        paddingVertical: 8,
                        borderBottomColor: COLORS.border,
                        borderBottomWidth: 1,
                    }}
                    >
                    <Text style={{ color: newOrderStatus === status ? COLORS.primary : COLORS.textDark }}>
                        {status}
                    </Text>
                    </TouchableOpacity>
                ))}
                </View>
              </>
            )}

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
  sectionHeaderSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 5,
  },
});

export default ButcherCustomerOrdersScreen;
