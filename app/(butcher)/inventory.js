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

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState(''); // e.g., beef, chicken, lamb
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPricePerKg, setNewItemPricePerKg] = useState('');

  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [updatedQuantity, setUpdatedQuantity] = useState('');
  const [updatedPricePerKg, setUpdatedPricePerKg] = useState('');

  const fetchInventory = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const inventoryRes = await api.getButcherInventory();
      setInventory(Array.isArray(inventoryRes.data?.inventory) ? inventoryRes.data.inventory : []);
    } catch (err) {
      console.error('❌ Butcher Inventory Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load inventory data. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const handleAddItem = async () => {
    if (!newItemName || !newItemType || !newItemQuantity || !newItemPricePerKg) {
      Alert.alert('Error', 'Please fill in all fields to add a new item.');
      return;
    }
    const quantity = parseFloat(newItemQuantity);
    const pricePerKg = parseFloat(newItemPricePerKg);

    if (isNaN(quantity) || isNaN(pricePerKg) || quantity <= 0 || pricePerKg <= 0) {
      Alert.alert('Error', 'Quantity and Price per Kg must be positive numbers.');
      return;
    }

    setShowAddItemModal(false); 
    try {
      await api.addButcherInventory({
        name: newItemName,
        meatType: newItemType.toLowerCase(),
        quantity,
        pricePerKg,
      });
      Alert.alert('Success', `${newItemName} added to your inventory.`);
      setNewItemName('');
      setNewItemType('');
      setNewItemQuantity('');
      setNewItemPricePerKg('');
      fetchInventory();
    } catch (err) {
      console.error('❌ Add Item Error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add item. Please try again.');
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem || (!updatedQuantity && !updatedPricePerKg)) {
      Alert.alert('Error', 'No changes detected or item not selected.');
      return;
    }

    const quantity = updatedQuantity ? parseFloat(updatedQuantity) : currentItem.quantity;
    const pricePerKg = updatedPricePerKg ? parseFloat(updatedPricePerKg) : currentItem.pricePerKg;

    if (isNaN(quantity) || isNaN(pricePerKg) || quantity < 0 || pricePerKg < 0) {
      Alert.alert('Error', 'Quantity and Price per Kg must be non-negative numbers.');
      return;
    }

    setShowUpdateItemModal(false); 
    try {
      await api.updateButcherInventory(currentItem._id, { quantity, pricePerKg });
      Alert.alert('Success', `${currentItem.name} updated.`);
      fetchInventory(); // Refresh list
    } catch (err) {
      console.error('❌ Update Item Error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item from your inventory?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await api.deleteButcherInventory(itemId);
              Alert.alert("Success", "Item deleted successfully.");
              fetchInventory();
            } catch (err) {
              console.error('❌ Delete Item Error:', err.response?.data || err.message);
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete item. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={inventory}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed item in Butcher Inventory tab:", item);
                return null;
              }

              const meatImageSource = meatImages[item.meatType?.toLowerCase()] || meatImages.default;

              return (
                <InfoCard
                  icon={
                    <Image
                      source={meatImageSource}
                      style={globalStyles.infoCardImage} 
                    />
                  }
                  title={String(item.name)}
                  value={`Type: ${String(item.meatType)} | Quantity: ${String(item.quantity)}kg`}
                  subtitle={`Price: KES ${String(item.pricePerKg)}/kg | Added: ${new Date(item.createdAt).toLocaleDateString()}`}
                >
                  <View style={localStyles.cardActions}>
                    <TouchableOpacity
                      style={[globalStyles.button, globalStyles.buttonSmall, { backgroundColor: COLORS.info }]}
                      onPress={() => {
                        setCurrentItem(item);
                        setUpdatedQuantity(String(item.quantity));
                        setUpdatedPricePerKg(String(item.pricePerKg));
                        setShowUpdateItemModal(true);
                      }}
                    >
                      <Text style={globalStyles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[globalStyles.buttonDanger, globalStyles.buttonSmall, { marginLeft: 10 }]}
                      onPress={() => handleDeleteItem(item._id)}
                    >
                      <Text style={globalStyles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInventory} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
          />
        )}
      </View>

      {/* Button to add new item */}
      <TouchableOpacity
        style={[globalStyles.button, { margin: 16, marginBottom: 24 }]}
        onPress={() => setShowAddItemModal(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color={COLORS.white} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Add New Meat Item</Text>
      </TouchableOpacity>


      {/* Add Item Modal */}
      <Modal
        visible={showAddItemModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddItemModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Inventory Item</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Meat Name (e.g., Beef Ribeye)"
              placeholderTextColor={COLORS.textLight}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Chicken, Lamb)"
              placeholderTextColor={COLORS.textLight}
              value={newItemType}
              onChangeText={setNewItemType}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (kg)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={newItemPricePerKg}
              onChangeText={setNewItemPricePerKg}
            />

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, localStyles.halfWidthButton]}
                onPress={() => setShowAddItemModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, localStyles.halfWidthButton]}
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
        visible={showUpdateItemModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpdateItemModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Update {currentItem?.name || 'Item'}</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (kg)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={updatedQuantity}
              onChangeText={setUpdatedQuantity}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={updatedPricePerKg}
              onChangeText={setUpdatedPricePerKg}
            />

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonOutline, localStyles.halfWidthButton]}
                onPress={() => setShowUpdateItemModal(false)}
              >
                <Text style={globalStyles.buttonOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, localStyles.halfWidthButton]}
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
    justifyContent: 'space-between',
    marginTop: 20,
  },
  halfWidthButton: {
    width: '48%',
  },
});

export default ButcherInventoryScreen;
