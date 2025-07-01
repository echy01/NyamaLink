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
import io from 'socket.io-client'; // Import socket.io-client

import beef from '../../assets/images/beef.png';
import goat from '../../assets/images/goat.png';
import chicken from '../../assets/images/chicken.png';
import pork from '../../assets/images/pork.png';
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


const SOCKET_SERVER_URL = 'http://192.168.1.3:5000'; 

const AgentInventoryScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || 'Slaughterhouse Agent';
  // You MUST ensure `agentId` is correctly passed or fetched.
  // It should be the MongoDB _id of the logged-in agent.
  // Example if passed from login screen: const agentId = params.userId;
  const agentId = params.id; // Assuming 'id' contains the agent's _id from navigation params

  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    meatType: '',
    quantity: '',
    pricePerKg: '',
    slaughterhouseName: userName || '', // Initialize with userName if available
    isPublic: true, // Default to true or add toggle
  });

  // Update slaughterhouseName in newInventoryItem if userName changes
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
  }, []); // No dependencies needed if agentId is from params and doesn't change

  useEffect(() => {
    fetchInventory();

    // Socket.IO setup for real-time updates
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'], // Prefer websockets
      // query: { userId: agentId }, // Optionally send userId with connection
    });

    socket.on('connect', () => {
      console.log('🔗 Socket.IO connected from AgentInventoryScreen');
      if (agentId) {
        socket.emit('join_room', agentId); // Join the room with agent's ID
        console.log(`Socket.IO AgentInventoryScreen joined room: ${agentId}`);
      }
    });

    socket.on('new_notification', (notification) => {
      console.log('🔔 New notification received in AgentInventoryScreen:', notification);
      // Check if the notification is for this agent AND relevant to inventory updates
      if (agentId && notification.recipientId === agentId && notification.type === 'purchase_status_update') {
        console.log('Relevant notification received, re-fetching inventory...');
        fetchInventory(); // Re-fetch data to update the UI
      } else {
        console.log('Notification not for this agent or not a relevant type.');
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected from AgentInventoryScreen');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket.IO connection error in AgentInventoryScreen:', err.message);
      // You might want to show an alert to the user or retry connection
    });

    // Clean up socket connection on component unmount
    return () => {
      console.log('AgentInventoryScreen unmounting, disconnecting socket...');
      socket.disconnect();
    };
  }, [fetchInventory, agentId]); // Dependencies: re-run if fetchInventory or agentId changes


  const handleAddInventoryItem = async () => {
    if (!newInventoryItem.meatType || !newInventoryItem.quantity || !newInventoryItem.pricePerKg) {
      return Alert.alert('Validation Error', 'Please fill all required fields: Meat Type, Quantity, and Price.');
    }

    if (!newInventoryItem.slaughterhouseName) {
        return Alert.alert('Error', 'Slaughterhouse name is missing. Please ensure your user profile is complete or manually set it.');
    }

    try {
      await api.addSlaughterhouseInventory({
        meatType: newInventoryItem.meatType,
        quantity: parseFloat(newInventoryItem.quantity),
        pricePerKg: parseFloat(newInventoryItem.pricePerKg),
        slaughterhouseName: newInventoryItem.slaughterhouseName,
        isPublic: newInventoryItem.isPublic,
      });
      // Reset form fields
      setNewInventoryItem(prev => ({ ...prev, meatType: '', quantity: '', pricePerKg: '', isPublic: true }));
      setShowAddInventoryModal(false);
      fetchInventory(); // Refresh list after adding
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
    <SafeAreaView style={localStyles.safeArea}>
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
            keyExtractor={(item) => String(item._id || item.meatType + item.slaughterhouseName + Math.random())} // Added Math.random() for robustness
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchInventory} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No inventory items found.</Text>}
          />
        )}
      </View>

      {/* Add Inventory Modal */}
      <Modal
        visible={showAddInventoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddInventoryModal(false)} // Android back button
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>Add New Inventory Item</Text>

            <TextInput
              style={globalStyles.input}
              placeholder="Meat Type (e.g., Beef, Goat)"
              value={newInventoryItem.meatType}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, meatType: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Quantity (kg)"
              value={newInventoryItem.quantity}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, quantity: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Price per Kg (KES)"
              value={newInventoryItem.pricePerKg}
              onChangeText={(text) => setNewInventoryItem({ ...newInventoryItem, pricePerKg: text })}
              keyboardType="numeric"
            />
            {/* Display slaughterhouseName but make it non-editable as it comes from userName */}
            <TextInput
              style={[globalStyles.input, { backgroundColor: COLORS.lightGrey }]}
              value={newInventoryItem.slaughterhouseName}
              editable={false}
              placeholder="Slaughterhouse Name"
            />
            {/* You could add a toggle for isPublic here if needed */}

            <View style={localStyles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1, marginRight: 10, backgroundColor: COLORS.secondary }]}
                onPress={() => setShowAddInventoryModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1 }]}
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Ensure background color is set
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0, // Keep 0 as FlatList handles horizontal padding
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
    maxHeight: '80%', // Limit height for smaller screens
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
});

export default AgentInventoryScreen;