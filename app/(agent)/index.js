import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import io from "socket.io-client";
import InfoCard from "../../components/InfoCard";
import api from "../api";
import COLORS from "../styles/colors";

const SOCKET_SERVER_URL = "http://192.168.180.19:5000";

const AgentHomeScreen = () => {
  const params = useLocalSearchParams();
  const userName = params.name || "Slaughterhouse Agent";

  const agentId = params.id;

  const [inventorySummary, setInventorySummary] = useState({
    totalStock: 0,
    distinctItems: 0,
  });
  const [ordersSummary, setOrdersSummary] = useState({
    pendingOrders: 0,
    totalOrders: 0,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgentSummaries = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const invRes = await api.getSlaughterhouseInventory();
      const currentInventory = Array.isArray(invRes.data) ? invRes.data : [];
      const totalStock = currentInventory.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      setInventorySummary({
        totalStock: totalStock.toFixed(2),
        distinctItems: currentInventory.length,
      });

      const ordersRes = await api.getButcheryOrders();
      const currentOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setOrdersSummary({
        pendingOrders: currentOrders.filter(
          (order) => order.status === "pending" || order.status === "processing"
        ).length,
        totalOrders: currentOrders.length,
      });
    } catch (err) {
      console.error(
        "❌ Agent Home Load Error:",
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
    fetchAgentSummaries();

    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔗 Socket.IO connected from AgentHomeScreen");
      if (agentId) {
        socket.emit("join_room", agentId);
        console.log(`Socket.IO AgentHomeScreen joined room: ${agentId}`);
      }
    });

    socket.on("new_notification", (notification) => {
      console.log(
        "🔔 New notification received in AgentHomeScreen:",
        notification
      );
      if (
        agentId &&
        notification.recipientId === agentId &&
        notification.type === "purchase_status_update"
      ) {
        console.log(
          "Relevant notification received, re-fetching agent summaries..."
        );
        fetchAgentSummaries();
      } else {
        console.log("Notification not for this agent or not a relevant type.");
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected from AgentHomeScreen");
    });

    socket.on("connect_error", (err) => {
      console.error(
        "❌ Socket.IO connection error in AgentHomeScreen:",
        err.message
      );
      // You might want to show an alert to the user or retry connection
    });

    // Clean up socket connection on component unmount
    return () => {
      console.log("AgentHomeScreen unmounting, disconnecting socket...");
      socket.disconnect();
    };
  }, [fetchAgentSummaries, agentId]); // Dependencies: re-run if fetchAgentSummaries or agentId changes

  return (
    <SafeAreaView style={localStyles.safeArea}>
      {/* Top Header Bar for "Agent Overview" */}
      <View style={localStyles.appHeader}>
        <Text style={localStyles.appTitle}>Agent Overview</Text>
      </View>

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAgentSummaries}
          />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={localStyles.loadingIndicator}
          />
        ) : (
          <View style={localStyles.overviewContainer}>
            {/* Main Section Header */}
            <View style={localStyles.sectionHeaderContainer}>
              <Text style={localStyles.greetingText}>
                Quick Overview for {String(userName)}
              </Text>
            </View>

            {/* Summary Cards */}
            <InfoCard
              icon="cube-outline" // Correct icon name for inventory
              title="Slaughterhouse Inventory"
              value={`${String(inventorySummary.totalStock)} kg`}
              subtitle={`Across ${String(
                inventorySummary.distinctItems
              )} unique meat types`}
            />

            <InfoCard
              icon="receipt-outline" // Correct icon name for orders
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },

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
    justifyContent: "flex-start", // Align to start for text and optional icon
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.textLight,
    flexShrink: 1, // Allows text to wrap
    marginRight: 10, // Space between text and icon
  },
  loadingIndicator: {
    marginTop: 50,
  },
  // Styles for optional notification icon
  notificationIconWrapper: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  notificationBadge: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: COLORS.danger,
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});

export default AgentHomeScreen;
