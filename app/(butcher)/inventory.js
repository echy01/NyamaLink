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

// Import your meat images
import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
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

const ButcherInventoryScreen = () => {
  const params = useLocalSearchParams(); 
  const userName = params.name || 'Butcher User'; 

  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ meatType: '', price: '', stock: '' });
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getButcherInventory(); 
      setInventory(Array.isArray(invRes.data?.inventory) ? invRes.data.inventory : []);
    } catch (err) {
      console.error('❌ Butcher Inventory Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load inventory data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchAll(); 
  }, [fetchAll]);  

  const handleAddItem = async () => {
    if (!newItem.meatType || !newItem.price || !newItem.stock) {
      return Alert.alert('Validation Error', 'Please fill all fields to add item.');
    }
    try {
      await api.addInventoryItem({
        meatType: newItem.meatType,
        price: parseFloat(newItem.price),
        stock: parseFloat(newItem.stock),
      });
      setNewItem({ meatType: '', price: '', stock: '' });
      setShowAddModal(false);
      fetchAll(); 
      Alert.alert('Success', 'Inventory item added successfully!');
    } catch (err) {
      Alert.alert('Add Item Error', err.response?.data?.message || err.message || 'Could not add item.');
      console.error('Add item error:', err.response?.data || err.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem || !currentItem._id || !currentItem.meatType || !currentItem.price || !currentItem.stock) {
      return Alert.alert('Validation Error', 'Invalid item data for update.');
    }
    try {
      await api.updateInventoryItem(currentItem._id, {
        meatType: currentItem.meatType,
        price: parseFloat(currentItem.price),
        stock: parseFloat(currentItem.stock),
        // isPublic is handled on backend if it's part of the update logic
      });
      setShowUpdateItemModal(false); // Close modal
      setCurrentItem(null); // Clear current item
      fetchAll(); // Refresh list
      Alert.alert('Success', 'Inventory item updated successfully!');
    } catch (err) {
      Alert.alert('Update Item Error', err.response?.data?.message || err.message || 'Could not update item.');
      console.error('Update item error:', err.response?.data || err.message);
    }
  };

  // Helper to get image based on meat type
  const getMeatImage = (meatType) => {
    const lowerMeatType = (meatType || '').toLowerCase();
    if (meatImages[lowerMeatType]) {
      return meatImages[lowerMeatType];
    }
    return meatImages.default;
  };

  const renderInventoryItem = ({ item }) => (
    <InfoCard
      title={item.meatType}
      value={`${Number(item.stock).toFixed(2)} Kg`}
      subtitle={`Ksh ${Number(item.price).toFixed(2)}/Kg`}
      imageSource={getMeatImage(item.meatType)}
      onPress={() => {
        setCurrentItem({ 
          _id: item._id, 
          meatType: item.meatType, 
          price: String(item.price), // Convert to string for TextInput
          stock: String(item.stock) // Convert to string for TextInput
        });
        setShowUpdateItemModal(true);
      }}
      // You can add more props to InfoCard if it supports them, e.g., for actions
      cardStyle={localStyles.inventoryCard}
    >
      {/* Optional: Add buttons for direct edit/delete if InfoCard can contain children */}
      <View style={localStyles.cardActions}>
        <TouchableOpacity 
          style={[localStyles.smallActionButton, { backgroundColor: COLORS.primary }]} 
          onPress={() => {
            setCurrentItem({ 
              _id: item._id, 
              meatType: item.meatType, 
              price: String(item.price), 
              stock: String(item.stock) 
            });
            setShowUpdateItemModal(true);
          }}
        >
          <Text style={globalStyles.buttonText}>Edit</Text>
        </TouchableOpacity>
        {/* You could add a delete button here, requiring a handleDeleteItem function */}
      </View>
    </InfoCard>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>My Inventory</Text>
      </View>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={inventory}
            keyExtractor={(item) => item._id}
            renderItem={renderInventoryItem}
            contentContainerStyle={globalStyles.flatListContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchAll} />
            }
            ListEmptyComponent={
              <Text style={globalStyles.emptyListText}>No inventory items found. Add some!</Text>
            }
          />
        )}

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 10 }} />
          <Text style={globalStyles.buttonText}>Add New Meat</Text>
        </TouchableOpacity>

      </View>

      {/* Add New Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Inventory Item</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat)"
              value={newItem.meatType}
              onChangeText={(text) => setNewItem({ ...newItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (e.g., 450)"
              value={newItem.price}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Stock Quantity in Kg (e.g., 100)"
              value={newItem.stock}
              onChangeText={(text) => setNewItem({ ...newItem, stock: text })}
              keyboardType="numeric"
            />
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.confirmButton]}
                onPress={handleAddItem}
              >
                <Text style={globalStyles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUpdateItemModal}
        onRequestClose={() => setShowUpdateItemModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Inventory Item</Text>
            {currentItem && (
              <>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Meat Type"
                  value={currentItem.meatType}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, meatType: text })}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Price per Kg"
                  value={currentItem.price}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, price: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Stock Quantity in Kg"
                  value={currentItem.stock}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, stock: text })}
                  keyboardType="numeric"
                />
              </>
            )}
            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.cancelButton]}
                onPress={() => setShowUpdateItemModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.confirmButton]}
                onPress={handleUpdateItem}
              >
                <Text style={globalStyles.buttonText}>Update Item</Text>
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
    justifyContent: 'space-around',
    marginTop: 20,
  },
  // Added style for the InfoCard specific to inventory
  inventoryCard: {
    marginBottom: 10, // Add some space between cards
  }
});

export default ButcherInventoryScreen;