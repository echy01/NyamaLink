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
      {/* Top Header Bar for "Agent Overview" */}
      <View style={localStyles.appHeader}>
        <Text style={localStyles.appTitle}>Agent Overview</Text>
      </View>

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAgentSummaries} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <View style={localStyles.overviewContainer}>
            {/* Main Section Header */}
            <View style={localStyles.sectionHeaderContainer}>
              <Text style={localStyles.greetingText}>Quick Overview for {String(userName)}</Text>
              {/* No notification icon here as per original AgentHomeScreen */}
            </View>

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
            {/* You can add more summary cards or quick action buttons here */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  // Adjusted scroll content to allow full horizontal padding from overviewContainer
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0, 
  },
  // Main container for all content below the fixed header
  overviewContainer: {
    paddingHorizontal: 20, 
    paddingVertical: 15, 
  },
  // New style for the fixed top header (Agent Overview text)
  appHeader: {
    height: 60, 
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    backgroundColor: COLORS.white, // Or a very light background color
    paddingHorizontal: 20,
    paddingTop: 10, // Adjust for SafeAreaView if needed
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '600', 
    color: COLORS.textDark,
  },
  // Container for "Quick Overview..." text
  sectionHeaderContainer: {
    flexDirection: 'row', 
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15, 
  },
  greetingText: {
    fontSize: 18, 
    fontWeight: '500', 
    color: COLORS.textLight, 
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default AgentHomeScreen;