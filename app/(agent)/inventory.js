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
import { useLocalSearchParams } from 'expo-router'; 

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.jpeg';
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

const AgentInventoryScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || 'Slaughterhouse Agent';

  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    meatType: '',
    quantity: '',
    pricePerKg: '',
    slaughterhouseName: userName || '', 
    isPublic: true,
  });

  useEffect(() => {
    if (userName && newInventoryItem.slaughterhouseName !== userName) {
      setNewInventoryItem(prev => ({ ...prev, slaughterhouseName: userName }));
    }
  }, [userName, newInventoryItem.slaughterhouseName]);


  const fetchInventory = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getSlaughterhouseInventory();
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err) {
      console.error('❌ Agent Inventory Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load inventory data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddInventoryItem = async () => {
    if (!newInventoryItem.meatType || !newInventoryItem.quantity || !newInventoryItem.pricePerKg) {
      return Alert.alert('Validation Error', 'Please fill all required fields: Meat Type, Quantity, and Price.');
    }

    if (!newInventoryItem.slaughterhouseName) {
        return Alert.alert('Error', 'Slaughterhouse name is missing. Please ensure your user profile is complete.');
    }

    try {
      await api.addSlaughterhouseInventory({
        meatType: newInventoryItem.meatType,
        quantity: parseFloat(newInventoryItem.quantity),
        pricePerKg: parseFloat(newInventoryItem.pricePerKg),
        slaughterhouseName: newInventoryItem.slaughterhouseName,
        isPublic: newInventoryItem.isPublic,
      });
      setNewInventoryItem(prev => ({ ...prev, meatType: '', quantity: '', pricePerKg: '', isPublic: false })); // Reset form
      setShowAddInventoryModal(false);
      fetchInventory(); 
      Alert.alert('Success', 'Inventory item added successfully!');
    } catch (err) {
      Alert.alert('Add Inventory Error', err.response?.data?.message || err.message || 'Failed to add inventory item.');
      console.error('Add Inventory Error:', err.response?.data || err.message);
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
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => setShowAddInventoryModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={globalStyles.buttonText}>Add New Meat</Text>
        </TouchableOpacity>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={inventory}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed inventory item:", item);
                return null;
              }
              return (
                <InfoCard
                  title={String(item.meatType)}
                  value={`Stock: ${String(item.quantity)}kg @ KES ${String(item.pricePerKg)}/kg`}
                  subtitle={`Slaughterhouse: ${String(item.slaughterhouseName)} | Public: ${item.isPublic ? 'Yes' : 'No'}`}
                  imageSource={getMeatImage(item.meatType)}
                >
                  {/* Add edit/delete actions if needed for inventory items */}
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id || item.meatType + item.slaughterhouseName)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInventory} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
          />
        )}
      </View>

      {/* Add Inventory Modal */}
      <Modal visible={showAddInventoryModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Meat to Inventory</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat)"
              value={newInventoryItem.meatType}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (in kg)"
              keyboardType="numeric"
              value={newInventoryItem.quantity}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, quantity: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              keyboardType="numeric"
              value={newInventoryItem.pricePerKg}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, pricePerKg: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Slaughterhouse Name"
              value={newInventoryItem.slaughterhouseName}
              editable={false} 
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, slaughterhouseName: text })}
            />
            <View style={localStyles.checkboxContainer}>
              <TouchableOpacity
                style={localStyles.checkbox}
                onPress={() => setNewInventoryItem({ ...newInventoryItem, isPublic: !newInventoryItem.isPublic })}
              >
                <Ionicons
                  name={newInventoryItem.isPublic ? 'checkbox-outline' : 'square-outline'}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={localStyles.checkboxLabel}>Make Publicly Available (for Butchers)</Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, localStyles.modalButton]}
                onPress={() => setShowAddInventoryModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, localStyles.modalButton]}
                onPress={handleAddInventoryItem}
              >
                <Text style={globalStyles.buttonText}>Add Item</Text>
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
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textDark,
  },
});

export default AgentInventoryScreen;
