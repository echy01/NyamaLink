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

const ButcherPurchaseScreen = () => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const STATUS_OPTIONS = ['pending', 'accepted', 'processing', 'ready_for_pickup', 'dispatched', 'arrived', 'completed', 'cancelled'];

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.getButcheryOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrder = async () => {
    if (!currentOrder || !newStatus) return Alert.alert('Validation Error', 'Select a status.');
    if (!STATUS_OPTIONS.includes(newStatus)) return Alert.alert('Invalid Status');

    const dispatchDetails = {};
    const deliveryConfirmation = {};

    if (['dispatched', 'arrived', 'completed'].includes(newStatus)) {
      if (!trackingNumber || !carrier || !estimatedDeliveryDate) {
        return Alert.alert('Validation Error', 'Enter tracking, carrier, and delivery date.');
      }
      dispatchDetails.trackingNumber = trackingNumber;
      dispatchDetails.carrier = carrier;
      dispatchDetails.estimatedDeliveryDate = new Date(estimatedDeliveryDate).toISOString();
    }

    if (['arrived', 'completed'].includes(newStatus)) {
      if (!receivedBy) return Alert.alert('Validation Error', 'Enter who received the order.');
      deliveryConfirmation.receivedBy = receivedBy;
    }

    try {
      await api.updateOrder(
        currentOrder._id,
        newStatus,
        Object.keys(dispatchDetails).length ? dispatchDetails : undefined,
        Object.keys(deliveryConfirmation).length ? deliveryConfirmation : undefined
      );
      setShowUpdateModal(false);
      setCurrentOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setCarrier('');
      setEstimatedDeliveryDate('');
      setReceivedBy('');
      fetchOrders();
    } catch (err) {
      Alert.alert('Update Error', err.response?.data?.message || 'Update failed.');
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
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No orders found.</Text>}
            renderItem={({ item }) => (
              <InfoCard
                icon="briefcase-outline"
                title={`Butcher: ${item.butcherName}`}
                value={`Order: ${item.meatType} | Qty: ${item.quantity}kg`}
                subtitle={[
                  `Status: ${item.status || 'pending'}`,
                  item.pickupDetails?.trackingNumber && `Tracking: ${item.pickupDetails.trackingNumber}`,
                  item.pickupDetails?.carrier && `Carrier: ${item.pickupDetails.carrier}`,
                  item.pickupDetails?.estimatedDeliveryDate && `Est. Delivery: ${new Date(item.pickupDetails.estimatedDeliveryDate).toLocaleDateString()}`,
                  item.receptionConfirmation?.receivedBy && `Received By: ${item.receptionConfirmation.receivedBy}`,
                  `Total: KES ${item.paymentStatus?.amountPaid ?? item.totalPrice ?? '---'}`,
                  `Placed: ${new Date(item.createdAt).toLocaleDateString()}`,
                ].filter(Boolean).join(' | ')}
              >
                <View style={localStyles.cardActions}>
                  <TouchableOpacity
                    style={[globalStyles.button, localStyles.smallActionButton]}
                    onPress={() => {
                      setCurrentOrder(item);
                      setNewStatus(item.status);
                      setTrackingNumber(item.pickupDetails?.trackingNumber || '');
                      setCarrier(item.pickupDetails?.carrier || '');
                      setEstimatedDeliveryDate(item.pickupDetails?.estimatedDeliveryDate?.split('T')[0] || '');
                      setReceivedBy(item.receptionConfirmation?.receivedBy || '');
                      setShowUpdateModal(true);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#fff" />
                    <Text style={globalStyles.buttonText}>Update Status</Text>
                  </TouchableOpacity>
                </View>
              </InfoCard>
            )}
          />
        )}
      </View>

      <Modal visible={showUpdateModal} animationType="slide" transparent>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Order</Text>
            <Text style={localStyles.modalSubtitle}>Order for {currentOrder?.butcherName}</Text>

            <View style={[globalStyles.input, { padding: 0 }]}> 
              <Picker selectedValue={newStatus} onValueChange={setNewStatus} style={{ height: 50 }}>
                <Picker.Item label="Select Status" value="" enabled={false} />
                {STATUS_OPTIONS.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>

            {['dispatched', 'arrived', 'completed'].includes(newStatus) && (
              <>
                <TextInput style={globalStyles.input} placeholder="Tracking Number" value={trackingNumber} onChangeText={setTrackingNumber} />
                <TextInput style={globalStyles.input} placeholder="Carrier" value={carrier} onChangeText={setCarrier} />
                <TextInput style={globalStyles.input} placeholder="Estimated Delivery Date (YYYY-MM-DD)" value={estimatedDeliveryDate} onChangeText={setEstimatedDeliveryDate} />
              </>
            )}

            {['arrived', 'completed'].includes(newStatus) && (
              <TextInput style={globalStyles.input} placeholder="Received By" value={receivedBy} onChangeText={setReceivedBy} />
            )}

            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowUpdateModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handleUpdateOrder}>
                <Text style={globalStyles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  contentContainer: { flex: 1, paddingTop: 10 },
  loadingIndicator: { marginTop: 50 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  smallActionButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 8, minWidth: 100, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: COLORS.bg, padding: 20, borderRadius: 12, width: '90%', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 15, textAlign: 'center' },
  modalSubtitle: { fontSize: 16, color: COLORS.textLight, marginBottom: 10, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  modalButton: { flex: 1, marginHorizontal: 5 },
});

export default ButcherPurchaseScreen;
