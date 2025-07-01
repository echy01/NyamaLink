import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import InfoCard from '../../components/InfoCard';
import api from '../api';
import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';

import beef from '../../assets/images/beef.png';
import chicken from '../../assets/images/chicken.png';
import goat from '../../assets/images/goat.png';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';
import pork from '../../assets/images/pork.png';

const meatImages = {
  beef,
  goat,
  chicken,
  pork,
  lamb,
  default: meatDefault,
};

const CustomerBrowseMeatScreen = () => {
  const router = useRouter();
  const [availableMeat, setAvailableMeat] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [currentMeatItem, setCurrentMeatItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const fetchAvailableMeat = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const meatRes = await api.getAvailableMeatForCustomers();
      setAvailableMeat(Array.isArray(meatRes.data?.availableMeat) ? meatRes.data.availableMeat : []);
    } catch (err) {
      console.error('❌ Customer Browse Meat Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load available meat. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

// Function to get current location
const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return Alert.alert('Permission Denied', 'Please enable location to proceed.');
  }

  const { coords } = await Location.getCurrentPositionAsync({});
  setDeliveryLocation({
    type: 'Point',
    coordinates: [coords.longitude, coords.latitude],
  });

  Alert.alert('📍 Location Set', 'Your current location will be used for delivery.');
};



  const handlePlaceOrder = async () => {
    if (!currentMeatItem || !orderQuantity) {
      Alert.alert('Error', 'Please select a meat item and enter a quantity.');
      return;
    }

    const quantity = parseFloat(orderQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Quantity must be a positive number.');
      return;
    }

    if (quantity > currentMeatItem.quantity) {
      Alert.alert('Error', `Requested quantity exceeds available stock (${currentMeatItem.quantity}kg).`);
      return;
    }

    if (!deliveryLocation) {
      Alert.alert('Missing Location', 'Please tap "Use My Current Location" to set a delivery location.');
      return;
    }

    setShowPlaceOrderModal(false);
    try {
      await api.placeCustomerOrder({
        meatId: currentMeatItem._id,
        quantity,
        deliveryLocation, 
      });

      Alert.alert('Success', `Order for ${quantity}kg of ${currentMeatItem.meatType} placed successfully.`);
      setOrderQuantity('');
      fetchAvailableMeat();
    } catch (err) {
      console.error('❌ Place Order Error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  useEffect(() => {
    fetchAvailableMeat();
  }, [fetchAvailableMeat]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        <TouchableOpacity
        style={globalStyles.button}
        onPress={() => router.push('/(modals)/customernearbybutcheries')}
        >
          <Text style={globalStyles.buttonText}>Find Butcheries Near Me</Text>
        </TouchableOpacity>        
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={availableMeat}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed meat item:", item);
                return null;
              }

              const meatImageSource = meatImages[item.meatType?.toLowerCase()] || meatImages.default;

              return (
                <InfoCard
                  imageSource={meatImageSource}
                  title={String(item.meatType)}
                  value={`Available: ${String(item.quantity)}kg`}
                  subtitle={`Price: KES ${String(item.pricePerKg)}/kg | From: ${String(item.butcheryName || 'N/A')}`}
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[globalStyles.button, globalStyles.buttonSmall]}
                      onPress={() => {
                        setCurrentMeatItem(item);
                        setOrderQuantity('');
                        setShowPlaceOrderModal(true);
                      }}
                    >
                      <Text style={globalStyles.buttonText}>Order Now</Text>
                    </TouchableOpacity>
                  </View>
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAvailableMeat} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No meat available for purchase at the moment.</Text>}
          />
        )}
      </View>

      {/* Place Order Modal */}
      <Modal
        visible={showPlaceOrderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlaceOrderModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Order {currentMeatItem?.meatType || 'Meat'}</Text>
            <Text style={globalStyles.label}>Available Quantity: {currentMeatItem?.quantity} kg</Text>
            <Text style={globalStyles.label}>Price per Kg: KES {currentMeatItem?.pricePerKg}</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Enter Quantity (kg)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />
            <TouchableOpacity
              style={[globalStyles.button, { marginVertical: 12 }]}
              onPress={getCurrentLocation}
            >
              <Text style={globalStyles.buttonText}>Use My Current Location</Text>
            </TouchableOpacity>

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, localStyles.halfWidthButton]}
                onPress={() => setShowPlaceOrderModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, localStyles.halfWidthButton]}
                onPress={handlePlaceOrder}
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  halfWidthButton: {
    width: '48%',
  },
});

export default CustomerBrowseMeatScreen;
