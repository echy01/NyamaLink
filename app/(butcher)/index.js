import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert, // Added Alert for error handling, as used in fetchButcherSummaries
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; // Assuming this contains basic container/text styles
import InfoCard from '../../components/InfoCard'; // Assuming this is a custom component
import api from '../api'; // Assuming this handles API calls
import COLORS from '../styles/colors'; // Your defined color palette
import { useLocalSearchParams, useRouter } from 'expo-router';

const ButcherHomeScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || 'Butcher User';
  const router = useRouter();

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
      const totalStock = currentInventory.reduce((sum, item) => sum + Number(item.stock || 0), 0);
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

      const shOrdersRes = await api.getMySlaughterhouseOrders();
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
      {/* Top Header Bar for "Butcher Overview" */}
      <View style={localStyles.appHeader}>
        <Text style={localStyles.appTitle}>Butcher Overview</Text>
      </View>

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchButcherSummaries} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={localStyles.loadingIndicator} />
        ) : (
          <View style={localStyles.overviewContainer}>
            {/* Main Section Header with Notification Icon */}
            <View style={localStyles.sectionHeaderContainer}>
              <Text style={localStyles.greetingText}>Quick Overview for {userName}</Text>
              <TouchableOpacity onPress={() => router.push('/notification')} style={localStyles.notificationIconWrapper}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                {/* Optional: Add a badge for unread notifications */}
                {/* <View style={localStyles.notificationBadge} /> */}
              </TouchableOpacity>
            </View>

            {/* Info Cards */}
            <InfoCard
              icon="cube-outline"
              title="Total Inventory Stock"
              value={`${String(inventorySummary.totalStock)} kg`}
              subtitle={`Across ${String(inventorySummary.distinctItems)} unique meat types`}
              // Example of adding custom styles if InfoCard supports it
              // cardStyle={localStyles.infoCardStyle}
              // valueStyle={localStyles.infoCardValue}
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
    paddingTop: 0, // No top padding here as appHeader takes care of it
  },
  // Main container for all content below the fixed header
  overviewContainer: {
    paddingHorizontal: 20, // Increased horizontal padding for a cleaner look
    paddingVertical: 15, // Add some vertical padding at the top of the scrollable content
  },
  // New style for the fixed top header (Butcher Overview text)
  appHeader: {
    height: 60, // Fixed height for the header
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
    fontWeight: '600', // Slightly less bold than 'bold' for a refined look
    color: COLORS.textDark,
  },
  // Container for "Quick Overview..." text and Notification Icon
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Increased space below the header
    marginTop: 15, // Space above the header within the scroll view
  },
  greetingText: {
    fontSize: 18, // Slightly smaller than before, more like a subtitle
    fontWeight: '500', // Medium weight
    color: COLORS.textLight, // Softer color for the greeting
    flexShrink: 1, // Allows text to shrink if icon is too close
    marginRight: 10, // Space between text and icon
  },
  notificationIconWrapper: {
    padding: 8, // Make the touchable area slightly larger
    borderRadius: 20, // A subtle rounded background for the icon
    backgroundColor: COLORS.background, // A very light background to highlight the icon
  },
  // Optional: For unread notification badge
  notificationBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: COLORS.danger, // Red dot
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  // Example styles for InfoCard if you want to override its internal look
  // infoCardStyle: {
  //   borderRadius: 12, // More rounded corners
  //   shadowColor: COLORS.darkGrey,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 8,
  //   elevation: 5,
  //   marginBottom: 15, // Increased spacing between cards
  // },
  // infoCardValue: {
  //   fontSize: 24, // Larger value text
  //   fontWeight: 'bold',
  //   color: COLORS.primary,
  // },
});

export default ButcherHomeScreen;