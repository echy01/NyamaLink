import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../api';
import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

const meatImages = {
  beef,
  goat,
  chicken,
  pork,
  lamb,
  default: meatDefault,
};

const PurchaseFromAgentsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const slaughterhouseId = params.slaughterhouseId;

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');

  const getMeatImage = (type) => meatImages[type?.toLowerCase()] || meatImages.default;

  const fetchInventory = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      let res;
      if (slaughterhouseId) {
        res = await api.getInventoryBySlaughterhouseId(slaughterhouseId);
      } else {
        res = await api.getAvailableMeatForPurchase();
      }
      const data = res.data?.availableMeat || res.data?.inventory || res.data;
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Purchase Inventory Load Error:', err.message);
      Alert.alert('Error', 'Failed to load inventory.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [slaughterhouseId]);

  const handleOrder = async () => {
    if (!selectedItem || !orderQuantity) return;

    const quantity = parseFloat(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }
    if (quantity > selectedItem.quantity) {
      Alert.alert('Out of Stock', `Only ${selectedItem.quantity}kg available.`);
      return;
    }

    try {
      await api.placeButcherOrder(selectedItem._id, quantity);
      Alert.alert('Success', 'Order placed successfully.');
      setShowOrderModal(false);
      setOrderQuantity('');
      fetchInventory();
    } catch (err) {
      console.error('❌ Order Error:', err.message);
      Alert.alert('Error', 'Could not place order.');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.contentContainer}>
        {!slaughterhouseId && (
          <TouchableOpacity
            style={[globalStyles.button, { marginHorizontal: 16, marginBottom: 10 }]}
            onPress={() => router.push('/(modals)/nearby-slaughterhouses')}
          >
            <Text style={globalStyles.buttonText}>Find Slaughterhouses Near Me</Text>
          </TouchableOpacity>
        )}

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

      <Modal visible={showOrderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order {selectedItem?.meatType}</Text>
            <Text style={globalStyles.label}>Available: {selectedItem?.quantity}kg</Text>
            <Text style={globalStyles.label}>Price: KES {selectedItem?.pricePerKg}/kg</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Enter quantity (kg)"
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, styles.halfButton]}
                onPress={() => setShowOrderModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, styles.halfButton]}
                onPress={handleOrder}
              >
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
    backgroundColor: COLORS.card,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.textDark,
  },
  detail: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  halfButton: {
    width: '48%',
  },
});

export default PurchaseFromAgentsScreen;
