import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, TextInput,
  ActivityIndicator, Alert, Image, StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import globalStyles from '../styles/globalStyles';
import COLORS from '../styles/colors';
import api from '../api';

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
import lamb from '../../assets/images/lamb.png';
import meatDefault from '../../assets/images/meat_default.jpeg';

const meatImages = { beef, goat, chicken, pork, lamb, default: meatDefault };

const getMeatImage = (type) => meatImages[type?.toLowerCase()] || meatImages.default;

const AgentInventoryViewScreen = () => {
  const { agentId } = useLocalSearchParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const router = useRouter();

  const fetchInventory = async () => {
    try {
      const res = await api.getInventoryByAgentId(agentId);
      setInventory(res.data?.inventory || []);
    } catch (err) {
      console.error('❌ Inventory Load Error:', err.message);
      Alert.alert('Error', 'Unable to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }
    if (quantity > selectedItem.quantity) {
      Alert.alert('Out of Stock', `Only ${selectedItem.quantity}kg available.`);
      return;
    }

    try {
      await api.createAgentPurchaseOrder({
        meatId: selectedItem._id,
        quantity: parseFloat(quantity)
      });
      Alert.alert('Success', 'Order placed successfully.');
      setModalVisible(false);
      setQuantity('');
      fetchInventory();
      router.replace('/(butcher)/purchase-from-agents');
    } catch (err) {
      console.error('❌ Order Error:', err.message);
      Alert.alert('Error', 'Could not place order.');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={globalStyles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Image
              source={getMeatImage(item.meatType)}
              style={{ width: '100%', height: 140, borderRadius: 10, marginBottom: 10 }}
            />
            <Text style={globalStyles.cardTitle}>{item.meatType}</Text>
            <Text style={{ color: COLORS.textLight }}>Available: {item.quantity}kg</Text>
            <Text style={{ color: COLORS.textLight }}>Price: KES {item.pricePerKg}/kg</Text>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 10 }]}
              onPress={() => {
                setSelectedItem(item);
                setQuantity('');
                setModalVisible(true);
              }}
            >
              <Text style={globalStyles.buttonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={globalStyles.emptyStateText}>This agent has no meat currently listed.</Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order {selectedItem?.meatType}</Text>
            <Text style={globalStyles.label}>Available: {selectedItem?.quantity}kg</Text>
            <Text style={globalStyles.label}>Price: KES {selectedItem?.pricePerKg}/kg</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Enter quantity (kg)"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={globalStyles.buttonOutline} onPress={() => setModalVisible(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.button} onPress={handleOrder}>
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
});

export default AgentInventoryViewScreen;
