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

const ButcherPurchaseScreen = () => {
  const [availableMeat, setAvailableMeat] = useState([]); 
  const [slaughterOrders, setSlaughterOrders] = useState([]); 

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Purchase Order Modals
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedMeatToOrder, setSelectedMeatToOrder] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const fetchPurchaseData = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [availMeatRes, shOrdersRes] = await Promise.all([
        api.getAvailableMeatForPurchase(),
        api.getSlaughterhouseOrders(),
      ]);
      setAvailableMeat(Array.isArray(availMeatRes.data?.meat) ? availMeatRes.data.meat : []); 
      setSlaughterOrders(Array.isArray(shOrdersRes.data?.orders) ? shOrdersRes.data.orders : []); 
    } catch (err) {
      console.error('❌ Butcher Purchase Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load purchase data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseData(); 
  }, [fetchPurchaseData]);

  const handlePlaceOrder = async () => {
    if (!selectedMeatToOrder || !orderQuantity || isNaN(parseFloat(orderQuantity)) || parseFloat(orderQuantity) <= 0) {
      return Alert.alert('Validation Error', 'Please enter a valid quantity.');
    }
    // Client-side validation: check if requested quantity exceeds available stock
    if (parseFloat(orderQuantity) > selectedMeatToOrder.quantity) {
      return Alert.alert('Order Failed', `Requested quantity (${orderQuantity}kg) exceeds available stock (${selectedMeatToOrder.quantity}kg).`);
    }

    try {
      await api.orderFromSlaughterhouse(selectedMeatToOrder._id, parseFloat(orderQuantity));
      setShowPlaceOrderModal(false);
      setSelectedMeatToOrder(null);
      setOrderQuantity('');
      fetchPurchaseData(); 
      Alert.alert('Success', 'Order placed with slaughterhouse successfully!');
    } catch (err) {
      Alert.alert('Place Order Error', err.response?.data?.message || err.message || 'Could not place order with slaughterhouse.');
      console.error('Place order error:', err.response?.data || err.message);
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
        <Text style={globalStyles.sectionHeader}>Available Meat from Slaughterhouses</Text>
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
                  icon="cube-outline"
                  title={String(item.meatType)}
                  value={`KES ${String(item.pricePerKg)}/kg | Stock: ${String(item.quantity)}kg`}
                  subtitle={`From: ${String(item.slaughterhouseName)}`}
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
                      <Text style={globalStyles.buttonText}>Order</Text>
                    </TouchableOpacity>
                  </View>
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPurchaseData} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available for purchase from slaughterhouses.</Text>}
          />
        )}

        <Text style={[globalStyles.sectionHeader, { marginTop: 20 }]}>Your Slaughterhouse Orders</Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={slaughterOrders}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed slaughter order item:", item);
                return null;
              }
              return (
                <InfoCard
                  icon="swap-horizontal-outline" 
                  title={`Order for ${String(item.meatType || 'N/A')}`} 
                  value={`Quantity: ${String(item.quantity)}kg`}
                  subtitle={`Status: ${String(item.status)} | From: ${String(item.slaughterhouseName || 'N/A')}`}
                />
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPurchaseData} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No orders placed with slaughterhouses.</Text>}
          />
        )}
      </View>

      {/* Place Order with Slaughterhouse Modal */}
      <Modal visible={showPlaceOrderModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Order Meat from Slaughterhouse</Text>
            {selectedMeatToOrder && (
              <Text style={localStyles.modalSubtitle}>Ordering: {String(selectedMeatToOrder.meatType)} ({String(selectedMeatToOrder.quantity)}kg available)</Text>
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
                <Text style={globalStyles.buttonText}>Place Order</Text>
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

export default ButcherPurchaseScreen;
