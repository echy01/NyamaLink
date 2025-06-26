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
import globalStyles from '../styles/globalStyles';
import api from '../api';
import COLORS from '../styles/colors';

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

const meatImages = { beef, goat, chicken, pork, lamb, default: meatDefault };

const getMeatImage = (meatType) => {
  const key = (meatType || '').toLowerCase();
  return meatImages[key] || meatImages.default;
};

const PurchaseFromAgentsScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const fetchInventory = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.getAvailableMeatForPurchase();
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load available meat from agents.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const handleOrder = async () => {
    if (!selectedItem || !orderQuantity) {
      return Alert.alert('Missing Info', 'Please enter a quantity.');
    }

    const quantity = parseFloat(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      return Alert.alert('Invalid Quantity', 'Please enter a valid positive number.');
    }

    if (quantity > selectedItem.quantity) {
      return Alert.alert('Too Much', `Requested quantity exceeds available stock (${selectedItem.quantity}kg).`);
    }

    setShowOrderModal(false);
    try {
      await api.createAgentPurchaseOrder({ meatId: selectedItem._id, quantity });
      Alert.alert('Success', `Ordered ${quantity}kg of ${selectedItem.meatType}`);
      setOrderQuantity('');
      fetchInventory();
    } catch (err) {
      console.error('Order Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Could not place order. Try again.');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={inventory}
            renderItem={({ item }) => {
              const imageSource = getMeatImage(item.meatType);

              return (
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Image source={imageSource} style={styles.image} />
                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{item.meatType}</Text>
                      <Text style={styles.detail}>Available: {item.quantity}kg</Text>
                      <Text style={styles.detail}>Price: KES {item.pricePerKg}/kg</Text>
                      <Text style={styles.detail}>From: {item.slaughterhouseName || 'N/A'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() => {
                        setSelectedItem(item);
                        setOrderQuantity('');
                        setShowOrderModal(true);
                      }}
                    >
                      <Text style={styles.orderButtonText}>Order Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInventory} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available at the moment.</Text>}
          />
        )}
      </View>

      {/* Order Modal */}
      <Modal visible={showOrderModal} transparent animationType="fade" onRequestClose={() => setShowOrderModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order {selectedItem?.meatType || 'Meat'}</Text>
            <Text style={globalStyles.label}>Available: {selectedItem?.quantity} kg</Text>
            <Text style={globalStyles.label}>Price: KES {selectedItem?.pricePerKg} /kg</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Enter Quantity (kg)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, styles.halfWidthButton]}
                onPress={() => setShowOrderModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, styles.halfWidthButton]} onPress={handleOrder}>
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
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: COLORS.textDark,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  halfWidthButton: {
    width: '48%',
  },
});

export default PurchaseFromAgentsScreen;
