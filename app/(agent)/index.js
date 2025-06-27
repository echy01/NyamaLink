import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';     
import api from '../api';                         
import COLORS from '../styles/colors';             
import { useLocalSearchParams } from 'expo-router'; 

const AgentHomeScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || 'Slaughterhouse Agent'; 

  const [inventorySummary, setInventorySummary] = useState({ totalStock: 0, distinctItems: 0 });
  const [ordersSummary, setOrdersSummary] = useState({ pendingOrders: 0, totalOrders: 0 });
  const [butchersSummary, setButchersSummary] = useState({ totalButchers: 0 });
  const [purchaseSummary, setPurchaseSummary] = useState({ pendingPurchases: 0, totalPurchases: 0 });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgentSummaries = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getSlaughterhouseInventory();
      const currentInventory = Array.isArray(invRes.data) ? invRes.data : [];
      const totalStock = currentInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setInventorySummary({
        totalStock: totalStock.toFixed(2),
        distinctItems: currentInventory.length,
      });

      const ordersRes = await api.getButcheryOrders();
      const currentOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setOrdersSummary({
        pendingOrders: currentOrders.filter(order => order.status === 'pending' || order.status === 'processing').length,
        totalOrders: currentOrders.length,
      });

      const butchersRes = await api.getButchers();
      const currentButchers = Array.isArray(butchersRes.data?.butchers) ? butchersRes.data.butchers : [];
      setButchersSummary({
        totalButchers: currentButchers.length,
      });

      // const purchaseOrdersRes = await api.getMyPurchaseOrders();
      // const currentPurchases = Array.isArray(purchaseOrdersRes.data) ? purchaseOrdersRes.data : [];
      // setPurchaseSummary({
      //   pendingPurchases: currentPurchases.filter(purchase => purchase.status === 'pending').length,
      //   totalPurchases: currentPurchases.length,
      // });

    } catch (err) {
      console.error('❌ Agent Home Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load dashboard summaries. Please try again.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentSummaries();
  }, [fetchAgentSummaries]);

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAgentSummaries} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <View style={localStyles.overviewContainer}>
            <Text style={localStyles.sectionHeader}>Quick Overview for {String(userName)}</Text>

            <InfoCard
              icon="cube-outline"
              title="Slaughterhouse Inventory"
              value={`${String(inventorySummary.totalStock)} kg`}
              subtitle={`Across ${String(inventorySummary.distinctItems)} unique meat types`}
            />

            <InfoCard
              icon="receipt-outline"
              title="Butcher Orders Received"
              value={`${String(ordersSummary.pendingOrders)} Pending`}
              subtitle={`Total: ${String(ordersSummary.totalOrders)} orders`}
            />

            <InfoCard
              icon="people-outline"
              title="Registered Butchers"
              value={`${String(butchersSummary.totalButchers)} Butchers`}
              subtitle="View all registered butcher profiles"
            />

            {/* <InfoCard
              icon="swap-horizontal-outline"
              title="My Supply Orders"
              value={`${String(purchaseSummary.pendingPurchases)} Pending`}
              subtitle={`Total: ${String(purchaseSummary.totalPurchases)} orders from other agents`}
            /> */}

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

export default AgentHomeScreen;
