import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';     
import api from '../api';                        
import COLORS from '../styles/colors';            

const CustomerMyOrdersScreen = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const myOrdersRes = await api.getMyCustomerOrders();
      setMyOrders(Array.isArray(myOrdersRes.data) ? myOrdersRes.data : []);
    } catch (error) {
      console.error('❌ Customer My Orders Load Error:', error.response?.status, error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load your orders. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyOrders(); 
  }, [fetchMyOrders]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={myOrders}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed order item:", item);
                return null;
              }
              return (
                <InfoCard
                  icon="receipt-outline"
                  title={`Order for ${String(item.meatType || 'N/A')}`}
                  value={`Quantity: ${String(item.quantity || '0')}kg | Total: KES ${String(item.totalPrice || '0')}`}
                  subtitle={`Status: ${String(item.status || 'N/A')} | From: ${String(item.butcheryName || 'N/A')} (Contact: ${String(item.butcherContact || 'N/A')}) | Ordered: ${new Date(item.createdAt).toLocaleDateString()}`}
                />
              );
            }}
            keyExtractor={(item) => String(item._id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMyOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>You have no past orders.</Text>}
          />
        )}
      </View>
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
});

export default CustomerMyOrdersScreen;
