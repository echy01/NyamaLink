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

const ButcherPurchaseScreen = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Purchase Order Management Modal
  const [showUpdatePurchaseModal, setShowUpdatePurchaseModal] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [newPurchaseOrderStatus, setNewPurchaseOrderStatus] = useState('');
  // Pickup details for purchase order
  const [purchaseOrderPickupTime, setPurchaseOrderPickupTime] = useState('');
  const [purchaseOrderPickedUpBy, setPurchaseOrderPickedUpBy] = useState('');
  // Reception confirmation for purchase order
  const [purchaseOrderReceivedBy, setPurchaseOrderReceivedBy] = useState('');
  const [purchaseOrderConditionAtReception, setPurchaseOrderConditionAtReception] = useState('');

  // Define allowed purchase order statuses for the butcher to choose from
  const PURCHASE_ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'received', 'cancelled'];

  const fetchPurchaseOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const purchaseOrdersRes = await api.getMySlaughterhouseOrders();
      setPurchaseOrders(Array.isArray(purchaseOrdersRes.data?.orders) ? purchaseOrdersRes.data.orders : []);
    } catch (err) {
      console.error('❌ Butcher Purchase Orders Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load purchase orders. Please try again.');
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
        return Alert.alert('Invalid Status', 'Please select a valid status: ' + PURCHASE_ORDER_STATUS_OPTIONS.join(', '));
    }

    const pickupDetails = {};
    const receptionConfirmation = {};

    // Collect pickup details if status implies pickup
    if (newPurchaseOrderStatus === 'picked_up' || newPurchaseOrderStatus === 'received') {
      if (!purchaseOrderPickupTime || !purchaseOrderPickedUpBy) {
        return Alert.alert('Validation Error', 'Pickup time and picked up by are required for picked_up/received status.');
      }
      pickupDetails.pickupTime = new Date(purchaseOrderPickupTime).toISOString();
      pickupDetails.pickedUpBy = purchaseOrderPickedUpBy;
    }

    // Collect reception confirmation if status implies reception
    if (newPurchaseOrderStatus === 'received') {
      if (!purchaseOrderReceivedBy || !purchaseOrderConditionAtReception) {
        return Alert.alert('Validation Error', 'Received by and condition at reception are required for received status.');
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
      setCurrentPurchaseOrder(null);
      setNewPurchaseOrderStatus('');
      // Clear pickup/reception states after successful update
      setPurchaseOrderPickupTime('');
      setPurchaseOrderPickedUpBy('');
      setPurchaseOrderReceivedBy('');
      setPurchaseOrderConditionAtReception('');
      fetchPurchaseOrders();
      Alert.alert('Success', 'Purchase order status updated successfully!');
    } catch (err) {
      Alert.alert('Update Purchase Order Error', err.response?.data?.message || err.message || 'Could not update purchase order status.');
      console.error('Update purchase order status error:', err.response?.data || err.message);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={purchaseOrders}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed purchase order item:", item);
                return null;
              }

              return (
                <InfoCard
                  icon="basket-outline"
                  title={`Slaughterhouse: ${String(item.slaughterhouseName || 'N/A')}`}
                  value={`Ordered: ${String(item.meatType || 'N/A')} | Quantity: ${String(item.quantity || '0')}kg`}
                  subtitle={
                    <Text>
                      <Text style={{fontWeight: 'bold'}}>Status:</Text> {String(item.status || 'N/A')}
                      {item.pickupDetails && item.pickupDetails.pickupTime && (
                        `\nPicked Up: ${new Date(item.pickupDetails.pickupTime).toLocaleString()}`
                      )}
                      {item.pickupDetails && item.pickupDetails.pickedUpBy && (
                        ` by ${String(item.pickupDetails.pickedUpBy)}`
                      )}
                      {item.receptionConfirmation && item.receptionConfirmation.receivedBy && (
                        `\nReceived By: ${String(item.receptionConfirmation.receivedBy)}`
                      )}
                      {item.receptionConfirmation && item.receptionConfirmation.receivedDate && (
                        ` on ${new Date(item.receptionConfirmation.receivedDate).toLocaleString()}`
                      )}
                      {item.receptionConfirmation && item.receptionConfirmation.conditionAtReception && (
                        ` (Condition: ${String(item.receptionConfirmation.conditionAtReception)})`
                      )}
                      {`\nTotal: KES ${String(item.totalPrice || '0')} | Placed: ${new Date(item.createdAt).toLocaleDateString()}`}
                    </Text>
                  }
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[
                        globalStyles.button,
                        localStyles.smallActionButton,
                        { backgroundColor: item.status === 'received' ? COLORS.success : COLORS.warning } // Use 'received'
                      ]}
                      onPress={() => {
                        setCurrentPurchaseOrder(item);
                        setNewPurchaseOrderStatus(String(item.status));
                        // Populate existing pickup/reception details if available
                        setPurchaseOrderPickupTime(item.pickupDetails?.pickupTime ? new Date(item.pickupDetails.pickupTime).toISOString().split('.')[0] : ''); // Format to YYYY-MM-DDTHH:MM:SS
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
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPurchaseOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No purchase orders found.</Text>}
          />
        )}
      </View>

      {/* Update Purchase Order Status Modal */}
      <Modal visible={showUpdatePurchaseModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Purchase Order Status</Text>
            {currentPurchaseOrder && (
              <Text style={localStyles.modalSubtitle}>Order from {String(currentPurchaseOrder.slaughterhouseName || 'N/A')} ({String(currentPurchaseOrder.meatType || 'N/A')})</Text>
            )}
            <TextInput
              style={globalStyles.input}
              placeholder="New Status (e.g., confirmed, picked_up, received)"
              value={newPurchaseOrderStatus}
              onChangeText={setNewPurchaseOrderStatus}
            />

            {/* Conditional Inputs for Pickup Details */}
            {(newPurchaseOrderStatus === 'picked_up' || newPurchaseOrderStatus === 'received') && (
              <>
                <Text style={localStyles.sectionHeaderSmall}>Pickup Details:</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Pickup Time (YYYY-MM-DDTHH:MM:SS)"
                  value={purchaseOrderPickupTime}
                  onChangeText={setPurchaseOrderPickupTime}
                  keyboardType="default" // Consider a datetime picker in real app
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Picked Up By (Name/ID)"
                  value={purchaseOrderPickedUpBy}
                  onChangeText={setPurchaseOrderPickedUpBy}
                />
              </>
            )}

            {/* Conditional Inputs for Reception Confirmation */}
            {newPurchaseOrderStatus === 'received' && (
              <>
                <Text style={localStyles.sectionHeaderSmall}>Reception Confirmation:</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Received By (Name/ID)"
                  value={purchaseOrderReceivedBy}
                  onChangeText={setPurchaseOrderReceivedBy}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Condition at Reception (e.g., good, damaged)"
                  value={purchaseOrderConditionAtReception}
                  onChangeText={setPurchaseOrderConditionAtReception}
                />
              </>
            )}

            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowUpdatePurchaseModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handleUpdatePurchaseOrder}>
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

export default ButcherPurchaseScreen;
