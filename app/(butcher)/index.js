import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import io from "socket.io-client";
import InfoCard from "../../components/InfoCard";
import api from "../api";
import COLORS from "../styles/colors";
import globalStyles from "../styles/globalStyles";

const SOCKET_SERVER_URL = "192.168.180.19:5000";

const ButcherHomeScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || "Butcher User";
  const router = useRouter();

  const [inventorySummary, setInventorySummary] = useState({
    totalStock: 0,
    distinctItems: 0,
  });
  const [ordersSummary, setOrdersSummary] = useState({
    pendingOrders: 0,
    totalOrders: 0,
  });
  const [purchaseSummary, setPurchaseSummary] = useState({
    pendingPurchases: 0,
    totalPurchases: 0,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // You might also want to add state for unread notifications if you uncommented that part
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchButcherSummaries = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getButcherInventory();
      const currentInventory = Array.isArray(invRes.data?.inventory)
        ? invRes.data.inventory
        : [];
      const totalStock = currentInventory.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0
      );
      setInventorySummary({
        totalStock: totalStock.toFixed(2),
        distinctItems: currentInventory.length,
      });

      const custOrdersRes = await api.getCustomerOrdersForButcher();
      const currentOrders = Array.isArray(custOrdersRes.data?.orders)
        ? custOrdersRes.data.orders
        : [];
      setOrdersSummary({
        pendingOrders: currentOrders.filter(
          (order) => order.status === "pending" || order.status === "processing"
        ).length,
        totalOrders: currentOrders.length,
      });

      const shOrdersRes = await api.getMySlaughterhouseOrders();
      const currentPurchases = Array.isArray(shOrdersRes.data?.orders)
        ? shOrdersRes.data.orders
        : [];
      setPurchaseSummary({
        pendingPurchases: currentPurchases.filter(
          (purchase) => purchase.status === "pending"
        ).length,
        totalPurchases: currentPurchases.length,
      });
    } catch (err) {
      console.error(
        "❌ Butcher Home Load Error:",
        err.response?.data || err.message
      );
      Alert.alert(
        "Error",
        "Failed to load dashboard summaries. Please try again."
      );
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchButcherSummaries();

    // Initialize Socket.IO connection
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"], // Use WebSocket first
    });

    socket.on("connect", () => {
      console.log("🟢 Socket.IO connected in ButcherHomeScreen");
      // Join a room specific to the butcher's ID for targeted notifications
      // You'll need to get the butcher's ID from authentication context or params
      const butcherId = params.userId; // Assuming userId is passed via params or available from auth context
      if (butcherId) {
        socket.emit("join_room", butcherId);
      }
    });

    socket.on("new_notification", (notification) => {
      console.log("🔔 New notification received:", notification);
      Alert.alert(notification.title, notification.message);
      // Optional: Update notification badge or list
      setUnreadNotifications((prev) => prev + 1); // Example: Increment unread count
      // Also, re-fetch summaries if a notification indicates a data change (e.g., new order)
      if (
        notification.type === "order_update" ||
        notification.type === "new_order"
      ) {
        fetchButcherSummaries();
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected from ButcherHomeScreen");
    });

    socket.on("connect_error", (err) => {
      console.error(
        "❌ Socket.IO connection error in ButcherHomeScreen:",
        err.message
      );
    });

    return () => {
      console.log("AgentHomeScreen unmounting, disconnecting socket...");
      socket.disconnect();
    };
  }, [fetchButcherSummaries, params.userId]); // Add params.userId to dependencies

  // Function to navigate to inventory screen
  const navigateToInventory = () => {
    router.push("/(butcher)/inventory"); // Adjust this path if your inventory screen is elsewhere
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchButcherSummaries}
          />
        }
      >
        <View style={localStyles.appHeader}>
          <Text style={localStyles.appTitle}>Butcher Overview</Text>
        </View>

        <View style={localStyles.overviewContainer}>
          <View style={localStyles.sectionHeaderContainer}>
            <Text style={localStyles.greetingText}>
              Welcome back,{" "}
              <Text style={{ fontWeight: "bold", color: COLORS.primary }}>
                {userName}!
              </Text>
            </Text>
            {/* Optional: Notification Icon - uncomment and implement unreadNotifications state if needed */}
            {/*
            <TouchableOpacity style={localStyles.notificationIconWrapper} onPress={() => router.push('/(butcher)/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
              {unreadNotifications > 0 && <View style={localStyles.notificationBadge} />}
            </TouchableOpacity>
            */}
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={localStyles.loadingIndicator}
            />
          ) : (
            <View>
              <Text style={globalStyles.sectionTitle}>Quick Summaries</Text>

              {/* Inventory Summary Card */}
              <InfoCard
                title="Total Inventory Stock"
                value={`${inventorySummary.totalStock} Kg`}
                subtitle={`${inventorySummary.distinctItems} distinct items`}
                icon="cube-outline"
                color={COLORS.info}
              />

              {/* Orders Summary Card */}
              <InfoCard
                title="Customer Orders"
                value={`${String(ordersSummary.pendingOrders)} Pending`}
                subtitle={`Total: ${String(ordersSummary.totalOrders)} orders`}
                icon="list-outline"
                color={COLORS.warning}
              />

              {/* Purchases Summary Card (from slaughterhouses) */}
              <InfoCard
                title="My Purchase Orders"
                value={`${String(purchaseSummary.pendingPurchases)} Pending`}
                subtitle={`Total: ${String(
                  purchaseSummary.totalPurchases
                )} purchases`}
                icon="wallet-outline"
                color={COLORS.success}
              />

              {/* New: Button to manage inventory */}
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  { marginTop: 20, backgroundColor: COLORS.secondary },
                ]}
                onPress={navigateToInventory}
              >
                <Ionicons
                  name="pricetags-outline"
                  size={20}
                  color={COLORS.white}
                  style={{ marginRight: 10 }}
                />
                <Text style={globalStyles.buttonText}>Manage My Inventory</Text>
              </TouchableOpacity>

              {/* You can add more summary cards or quick action buttons here */}
            </View>
          )}
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    backgroundColor: COLORS.white, // Or a very light background color
    paddingHorizontal: 20,
    paddingTop: 10, // Adjust for SafeAreaView if needed
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  // Container for "Quick Overview..." text
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Changed to flex-start
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  greetingText: {
    fontSize: 18, // Slightly smaller than before, more like a subtitle
    fontWeight: "500", // Medium weight
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
    position: "absolute",
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
});

export default ButcherHomeScreen;
