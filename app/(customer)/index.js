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
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';    
import api from '../api';                        
import COLORS from '../styles/colors';           

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

const CustomerBrowseMeatScreen = () => {
  const [availableMeat, setAvailableMeat] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedMeatToOrder, setSelectedMeatToOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const fetchAvailableMeat = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const availableMeatRes = await api.getAvailableMeatForCustomers();
      setAvailableMeat(Array.isArray(availableMeatRes.data) ? availableMeatRes.data : []);
    } catch (error) {
      console.error('❌ Customer Browse Meat Load Error:', error.response?.status, error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load available meat. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableMeat();
  }, [fetchAvailableMeat]);

  const handlePlaceOrder = async () => {
    if (!selectedMeatToOrder || !orderQuantity || isNaN(parseFloat(orderQuantity)) || parseFloat(orderQuantity) <= 0) {
      return Alert.alert('Validation Error', 'Please enter a valid quantity.');
    }

    if (parseFloat(orderQuantity) > selectedMeatToOrder.quantity) {
      return Alert.alert('Order Failed', `Requested quantity (${orderQuantity}kg) exceeds available stock (${selectedMeatToOrder.quantity}kg).`);
    }

    try {
      await api.placeCustomerOrder(selectedMeatToOrder._id, parseFloat(orderQuantity));
      setShowPlaceOrderModal(false);
      setSelectedMeatToOrder(null);
      setOrderQuantity('');
      fetchAvailableMeat(); 
      Alert.alert('Success', 'Your order has been placed successfully!');
    } catch (error) {
      Alert.alert('Order Error', error.response?.data?.message || 'Failed to place order.');
      console.error('Place order error:', error.response?.data || error.message);
    }
  };

  const getMeatImage = (meatType) => {
    const lowerMeatType = (meatType || '').toLowerCase();
    if (meatImages[lowerMeatType]) {
      return meatImages[lowerMeatType];
    }
    return meatImages.default;
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAvailableMeat} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available from butchers.</Text>}
          />
        )}
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

export default CustomerBrowseMeatScreen;
