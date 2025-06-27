import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../api';
import globalStyles from '../styles/globalStyles';
import COLORS from '../styles/colors';

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

import InfoCard from '../../components/InfoCard';

const meatImages = {
  beef,
  goat,
  chicken,
  pork,
  lamb,
  default: meatDefault,
};

const ButcherInventoryView = () => {
  const { butcherId } = useLocalSearchParams();
  const [meatList, setMeatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentMeatItem, setCurrentMeatItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const router = useRouter();

  const fetchInventory = async () => {
    try {
      const response = await api.getInventoryByButcherId(butcherId);
      setMeatList(response.data?.inventory || []);
    } catch (err) {
      console.error('❌ Inventory Error:', err.message);
      Alert.alert('Error', 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handlePlaceOrder = async () => {
    if (!currentMeatItem || !orderQuantity) {
      Alert.alert('Error', 'Please enter quantity.');
      return;
    }
    const qty = parseFloat(orderQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Quantity must be a positive number.');
      return;
    }
    if (qty > currentMeatItem.quantity) {
      Alert.alert('Error', `Only ${currentMeatItem.quantity}kg available.`);
      return;
    }

    setShowModal(false);
    try {
      await api.placeCustomerOrder(currentMeatItem._id, qty);
      Alert.alert('Success', `Order for ${qty}kg of ${currentMeatItem.meatType} placed.`);
      setOrderQuantity('');
      router.replace('/(customer)/my-orders'); // ✅ Redirect to orders
    } catch (err) {
      console.error('❌ Order Error:', err.message);
      Alert.alert('Error', 'Order failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={globalStyles.loadingText}>Loading butcher inventory...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={meatList}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        renderItem={({ item }) => {
          const meatImageSource = meatImages[item.meatType?.toLowerCase()] || meatImages.default;

          return (
            <InfoCard
              imageSource={meatImageSource}
              title={String(item.meatType)}
              value={`Available: ${String(item.quantity)}kg`}
              subtitle={`Price: KES ${String(item.pricePerKg)}/kg`}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonSmall]}
                  onPress={() => {
                    setCurrentMeatItem(item);
                    setOrderQuantity('');
                    setShowModal(true);
                  }}
                >
                  <Text style={globalStyles.buttonText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </InfoCard>
          );
        }}
        ListEmptyComponent={
          <Text style={globalStyles.emptyStateText}>
            This butcher has no meat listed currently.
          </Text>
        }
      />

      {/* Order Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Order {currentMeatItem?.meatType || 'Meat'}
            </Text>
            <Text style={globalStyles.label}>
              Available: {currentMeatItem?.quantity} kg
            </Text>
            <Text style={globalStyles.label}>
              Price: KES {currentMeatItem?.pricePerKg} per kg
            </Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Enter quantity (kg)"
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
              placeholderTextColor={COLORS.textLight}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, styles.halfWidthButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, styles.halfWidthButton]}
                onPress={handlePlaceOrder}
              >
                <Text style={globalStyles.buttonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 15,
    textAlign: 'center',
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

export default ButcherInventoryView;
