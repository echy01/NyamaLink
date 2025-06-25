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
import chicken from '../../assets/images/chicken.jpeg';
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

const ButcherInventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inventory Management Modals
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
        isPublic: true, 
      });
      setShowUpdateItemModal(false);
      setCurrentItem(null);
      fetchAll(); 
      Alert.alert('Success', 'Inventory item updated successfully!');
    } catch (err) {
      Alert.alert('Update Item Error', err.response?.data?.message || err.message || 'Could not update item.');
      console.error('Update item error:', err.response?.data || err.message);
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
        <TouchableOpacity style={globalStyles.button} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={globalStyles.buttonText}>Add New Item</Text>
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
                  value={`Stock: ${item.stock ?? 'N/A'}kg @ KES ${item.price ?? 'N/A'}/kg`}
                  subtitle={`Butchery: ${String(item.slaughterhouseName)}`} 
                  imageSource={getMeatImage(item.meatType)}
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[globalStyles.buttonOutline, localStyles.smallActionButton]}
                      onPress={() => {
                        setCurrentItem({
                            _id: item._id,
                            meatType: String(item.meatType),
                            price: String(item.pricePerKg),
                            stock: String(item.quantity) 
                        });
                        setShowUpdateItemModal(true);
                      }}
                    >
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={globalStyles.buttonOutlineText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </InfoCard>
              );
            }}
            keyExtractor={(item) => item._id ? String(item._id) : Math.random().toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
          />
        )}
      </View>

      {/* Add Item Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Inventory Item</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat, Chicken, Pork, Lamb)"
              value={newItem.meatType}
              onChangeText={(text) => setNewItem({ ...newItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              keyboardType="numeric"
              value={String(newItem.price)}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Stock (Kg)"
              keyboardType="numeric"
              value={String(newItem.stock)}
              onChangeText={(text) => setNewItem({ ...newItem, stock: text })}
            />
            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowAddModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handleAddItem}>
                <Text style={globalStyles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Item Modal */}
      <Modal visible={showUpdateItemModal} animationType="slide" transparent={true}>
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update Inventory Item</Text>
            {currentItem && (
              <>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Meat Type"
                  value={String(currentItem.meatType)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, meatType: text })}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Price per Kg"
                  keyboardType="numeric"
                  value={String(currentItem.price)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, price: text })}
                />
                <TextInput
                  style={globalStyles.input}
                  placeholder="Stock (Kg)"
                  keyboardType="numeric"
                  value={String(currentItem.stock)}
                  onChangeText={(text) => setCurrentItem({ ...currentItem, stock: text })}
                />
              </>
            )}
            <View style={localStyles.modalButtons}>
              <TouchableOpacity style={[globalStyles.buttonOutline, localStyles.modalButton]} onPress={() => setShowUpdateItemModal(false)}>
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, localStyles.modalButton]} onPress={handleUpdateItem}>
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

export default ButcherInventoryScreen;
