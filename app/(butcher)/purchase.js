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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';    
import api from '../api';                        
import COLORS from '../styles/colors';             

const ButcherPurchaseScreen = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [showUpdatePurchaseModal, setShowUpdatePurchaseModal] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [newPurchaseOrderStatus, setNewPurchaseOrderStatus] = useState('');
  const [purchaseOrderPickupTime, setPurchaseOrderPickupTime] = useState('');
  const [purchaseOrderPickedUpBy, setPurchaseOrderPickedUpBy] = useState('');
  const [purchaseOrderReceivedBy, setPurchaseOrderReceivedBy] = useState('');
  const [purchaseOrderConditionAtReception, setPurchaseOrderConditionAtReception] = useState('');

  const PURCHASE_ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'received', 'cancelled'];

  const fetchPurchaseOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.getMySlaughterhouseOrders();
      setPurchaseOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch (err) {
      console.error('❌ Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load purchase orders.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleUpdatePurchaseOrder = async () => {
    if (!currentPurchaseOrder || !newPurchaseOrderStatus) {
      return Alert.alert('Validation Error', 'Please select an order and status.');
    }
    if (!PURCHASE_ORDER_STATUS_OPTIONS.includes(newPurchaseOrderStatus)) {
      return Alert.alert('Invalid Status', 'Allowed statuses: ' + PURCHASE_ORDER_STATUS_OPTIONS.join(', '));
    }

    const pickupDetails = {};
    const receptionConfirmation = {};

    if (['picked_up', 'received'].includes(newPurchaseOrderStatus)) {
      if (!purchaseOrderPickupTime || !purchaseOrderPickedUpBy) {
        return Alert.alert('Validation Error', 'Pickup time and picked up by are required.');
      }
      pickupDetails.pickupTime = new Date(purchaseOrderPickupTime).toISOString();
      pickupDetails.pickedUpBy = purchaseOrderPickedUpBy;
    }

    if (newPurchaseOrderStatus === 'received') {
      if (!purchaseOrderReceivedBy || !purchaseOrderConditionAtReception) {
        return Alert.alert('Validation Error', 'Reception details are required.');
      }
      receptionConfirmation.receivedBy = purchaseOrderReceivedBy;
      receptionConfirmation.conditionAtReception = purchaseOrderConditionAtReception;
    }

    try {
      await api.updatePurchaseOrder(
        currentPurchaseOrder._id,
        newPurchaseOrderStatus,
        Object.keys(pickupDetails).length > 0 ? pickupDetails : undefined,
        Object.keys(receptionConfirmation).length > 0 ? receptionConfirmation : undefined
      );
      setShowUpdatePurchaseModal(false);
      fetchPurchaseOrders();
      Alert.alert('Success', 'Purchase order updated.');
    } catch (err) {
      Alert.alert('Update Error', err.response?.data?.message || err.message || 'Could not update status.');
    }
  };

  const handleInitiatePayment = async (order) => {
    try {
      const res = await api.initializePayment({
        amount: order.totalPrice,
        orderId: order._id,
      });

      if (res.data?.paymentUrl) {
        navigation.navigate('payment/PaymentWebView', {
          paymentUrl: res.data.paymentUrl,
        });
      } else {
        Alert.alert('Payment Error', 'Payment URL not found.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Error', 'Could not initiate payment.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={purchaseOrders}
            renderItem={({ item }) => (
              <InfoCard
                icon="basket-outline"
                title={`Slaughterhouse: ${item.slaughterhouseName}`}
                value={`Ordered: ${item.meatType} | Qty: ${item.quantity}kg`}
                subtitle={
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Status:</Text> {item.status}
                    {item.pickupDetails?.pickupTime && `\nPicked Up: ${new Date(item.pickupDetails.pickupTime).toLocaleString()}`}
                    {item.pickupDetails?.pickedUpBy && ` by ${item.pickupDetails.pickedUpBy}`}
                    {item.receptionConfirmation?.receivedBy && `\nReceived By: ${item.receptionConfirmation.receivedBy}`}
                    {item.receptionConfirmation?.conditionAtReception && ` (Condition: ${item.receptionConfirmation.conditionAtReception})`}
                    {`\nTotal: KES ${item.totalPrice} | Placed: ${new Date(item.createdAt).toLocaleDateString()}`}
                  </Text>
                }
              >
                <View style={localStyles.cardActions}>
                  {item.paymentStatus?.status !== 'paid' && (
                    <TouchableOpacity
                      style={[globalStyles.button, localStyles.smallActionButton]}
                      onPress={() => handleInitiatePayment(item)}
                    >
                      <Text style={globalStyles.buttonText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[globalStyles.button, localStyles.smallActionButton]}
                    onPress={() => {
                      setCurrentPurchaseOrder(item);
                      setNewPurchaseOrderStatus(item.status);
                      setPurchaseOrderPickupTime(item.pickupDetails?.pickupTime || '');
                      setPurchaseOrderPickedUpBy(item.pickupDetails?.pickedUpBy || '');
                      setPurchaseOrderReceivedBy(item.receptionConfirmation?.receivedBy || '');
                      setPurchaseOrderConditionAtReception(item.receptionConfirmation?.conditionAtReception || '');
                      setShowUpdatePurchaseModal(true);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#fff" />
                    <Text style={globalStyles.buttonText}>Update Status</Text>
                  </TouchableOpacity>
                </View>
              </InfoCard>
            )}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPurchaseOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No purchase orders found.</Text>}
          />
        )}
      </View>

      {/* Modal for updating purchase order status */}
      <Modal
        visible={showUpdatePurchaseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUpdatePurchaseModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Purchase Order</Text>
            <Text style={localStyles.modalSubtitle}>
              Order: {currentPurchaseOrder?.meatType} ({currentPurchaseOrder?.quantity}kg)
            </Text>
            <Text style={{ marginBottom: 8 }}>Status:</Text>
            {PURCHASE_ORDER_STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  localStyles.statusOption,
                  newPurchaseOrderStatus === status && localStyles.selectedStatusOption,
                ]}
                onPress={() => setNewPurchaseOrderStatus(status)}
              >
                <Text
                  style={{
                    color: newPurchaseOrderStatus === status ? COLORS.primary : COLORS.textDark,
                  }}
                >
                  {status.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}

            {['picked_up', 'received'].includes(newPurchaseOrderStatus) && (
              <>
                <Text style={{ marginTop: 12 }}>Pickup Time (YYYY-MM-DD HH:mm):</Text>
                <TextInput
                  style={localStyles.input}
                  value={purchaseOrderPickupTime}
                  onChangeText={setPurchaseOrderPickupTime}
                  placeholder="e.g. 2024-06-26 14:00"
                />
                <Text style={{ marginTop: 8 }}>Picked Up By:</Text>
                <TextInput
                  style={localStyles.input}
                  value={purchaseOrderPickedUpBy}
                  onChangeText={setPurchaseOrderPickedUpBy}
                  placeholder="Name"
                />
              </>
            )}

            {newPurchaseOrderStatus === 'received' && (
              <>
                <Text style={{ marginTop: 8 }}>Received By:</Text>
                <TextInput
                  style={localStyles.input}
                  value={purchaseOrderReceivedBy}
                  onChangeText={setPurchaseOrderReceivedBy}
                  placeholder="Name"
                />
                <Text style={{ marginTop: 8 }}>Condition at Reception:</Text>
                <TextInput
                  style={localStyles.input}
                  value={purchaseOrderConditionAtReception}
                  onChangeText={setPurchaseOrderConditionAtReception}
                  placeholder="e.g. Good, Damaged"
                />
              </>
            )}

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1, marginRight: 8 }]}
                onPress={handleUpdatePurchaseOrder}
              >
                <Text style={globalStyles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1, backgroundColor: COLORS.border }]}
                onPress={() => setShowUpdatePurchaseModal(false)}
              >
                <Text style={[globalStyles.buttonText, { color: COLORS.textDark }]}>Cancel</Text>
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
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  smallActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 4,
    minWidth: 100,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    backgroundColor: COLORS.bg,
    color: COLORS.textDark,
  },
  statusOption: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
    marginRight: 6,
    marginTop: 2,
  },
  selectedStatusOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
});

export default ButcherPurchaseScreen;