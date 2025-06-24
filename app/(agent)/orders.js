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

const AgentOrdersScreen = () => {
  const [orders, setOrders] = useState([]); 
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const ordersRes = await api.getButcheryOrders(); 
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (err) {
      console.error('❌ Agent Butcher Orders Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load butcher orders. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(); 
  }, [fetchOrders]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <FlatList
            data={orders}
            renderItem={({ item }) => {
              if (!item || !item._id) {
                console.warn("Skipping malformed order item in Agent Orders tab:", item);
                return null;
              }

              return (
                <InfoCard
                  icon="receipt-outline"
                  title={`Order from: ${String(item.butcherName || 'N/A')}`}
                  value={`Meat: ${String(item.meatType || 'N/A')} | Quantity: ${String(item.quantity || '0')}kg`}
                  subtitle={`Status: ${String(item.status || 'N/A')} | Placed: ${new Date(item.createdAt).toLocaleDateString()}`}
                >
                  {/* You can add actions here if agents can update butcher order status */}
                </InfoCard>
              );
            }}
            keyExtractor={(item) => String(item._id || item.butcherName + item.createdAt)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
            ListEmptyComponent={<Text style={globalStyles.emptyStateText}>No butcher purchase orders found for your slaughterhouse.</Text>}
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

export default AgentOrdersScreen;
