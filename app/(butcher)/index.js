import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  ScrollView, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';    
import api from '../api';                         
import COLORS from '../styles/colors';            
import { useLocalSearchParams } from 'expo-router'; 

const ButcherHomeScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || 'Butcher User'; 

  const [inventorySummary, setInventorySummary] = useState({ totalStock: 0, distinctItems: 0 });
  const [ordersSummary, setOrdersSummary] = useState({ pendingOrders: 0, totalOrders: 0 });
  const [purchaseSummary, setPurchaseSummary] = useState({ pendingPurchases: 0, totalPurchases: 0 });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchButcherSummaries = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getButcherInventory();
      const currentInventory = Array.isArray(invRes.data?.inventory) ? invRes.data.inventory : [];
      const totalStock = currentInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setInventorySummary({
        totalStock: totalStock.toFixed(2), 
        distinctItems: currentInventory.length,
      });

      const custOrdersRes = await api.getCustomerOrdersForButcher();
      const currentOrders = Array.isArray(custOrdersRes.data?.orders) ? custOrdersRes.data.orders : [];
      setOrdersSummary({
        pendingOrders: currentOrders.filter(order => order.status === 'pending' || order.status === 'processing').length,
        totalOrders: currentOrders.length,
      });

      const shOrdersRes = await api.getSlaughterhouseOrders();
      const currentPurchases = Array.isArray(shOrdersRes.data?.orders) ? shOrdersRes.data.orders : [];
      setPurchaseSummary({
        pendingPurchases: currentPurchases.filter(purchase => purchase.status === 'pending').length,
        totalPurchases: currentPurchases.length,
      });

    } catch (err) {
      console.error('❌ Butcher Home Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load dashboard summaries. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchButcherSummaries(); 
  }, [fetchButcherSummaries]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchButcherSummaries} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <View style={localStyles.overviewContainer}>
            <Text style={localStyles.sectionHeader}>Quick Overview for {userName}</Text>

            <InfoCard
              icon="cube-outline"
              title="Total Inventory Stock"
              value={`${String(inventorySummary.totalStock)} kg`}
              subtitle={`Across ${String(inventorySummary.distinctItems)} unique meat types`}
            />

            <InfoCard
              icon="receipt-outline"
              title="Customer Orders"
              value={`${String(ordersSummary.pendingOrders)} Pending`}
              subtitle={`Total: ${String(ordersSummary.totalOrders)} orders`}
            />

            <InfoCard
              icon="cart-outline"
              title="Slaughterhouse Purchases"
              value={`${String(purchaseSummary.pendingPurchases)} Pending`}
              subtitle={`Total: ${String(purchaseSummary.totalPurchases)} purchases`}
            />

            <InfoCard
              icon="business-outline"
              title="Your Butchery"
              value={String(userName)}
              subtitle="Providing fresh cuts to the community!"
            />

            {/* You can add more summary cards or quick action buttons here */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, 
    paddingHorizontal: 0, 
    paddingTop: 10,
  },
  overviewContainer: {
    paddingHorizontal: 16, 
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default ButcherHomeScreen;
