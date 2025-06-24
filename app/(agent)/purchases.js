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

const AgentPurchasesScreen = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]); 
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const purchaseOrdersRes = await api.getMyPurchaseOrders(); 
      setPurchaseOrders(Array.isArray(purchaseOrdersRes.data) ? purchaseOrdersRes.data : []);
    } catch (err) {
      console.error('❌ Agent My Purchases Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load your purchase orders. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders(); 
  }, [fetchPurchaseOrders]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={purchaseOrders}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed purchase order item:", item);
                return null;
              }
              return (
                <InfoCard
                  icon="swap-horizontal-outline"
                  title={`Purchase of: ${String(item.meatType || 'N/A')}`}
                  value={`Quantity: ${String(item.quantity)}kg`}
                  subtitle={`Status: ${String(item.status)} | From: ${String(item.slaughterhouseName || 'N/A')}`}
                />
              );
            }}
            keyExtractor={(item) => String(item._id || item.meatId + item.createdAt)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchPurchaseOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No purchase orders found.</Text>}
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

export default AgentPurchasesScreen;
