import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api";
import COLORS from "../styles/colors";
import globalStyles from "../styles/globalStyles";
import socket from "../../utils/socket"; 

const NotificationItem = ({ notification }) => {
  const getIconAndColor = (type) => {
    switch (type) {
      case "order_status_update":
        return { icon: "cube-outline", color: COLORS.accent };
      case "purchase_status_update":
        return { icon: "briefcase-outline", color: COLORS.info };
      case "payment_received":
        return { icon: "wallet-outline", color: COLORS.success };
      case "new_message":
        return { icon: "chatbox-outline", color: COLORS.warning };
      case "info":
      default:
        return { icon: "information-circle-outline", color: COLORS.darkGrey };
    }
  };

  const { icon, color } = getIconAndColor(notification.type);

  return (
    <TouchableOpacity
      style={[
        globalStyles.card,
        localStyles.notificationCard,
        notification.read
          ? localStyles.readNotification
          : localStyles.unreadNotification,
      ]}
      onPress={() => console.log("Notification pressed:", notification.id)}
    >
      <View style={localStyles.notificationContent}>
        <View
          style={[
            globalStyles.notificationIconContainer,
            { backgroundColor: color + "20" },
          ]}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={localStyles.textContainer}>
          <Text style={localStyles.notificationTitle}>
            {notification.title}
          </Text>
          <Text style={localStyles.notificationMessage}>
            {notification.message}
          </Text>
          <Text style={localStyles.notificationTimestamp}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </View>
        {!notification.read && <View style={localStyles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ Listen for real-time notifications via socket.io
  useEffect(() => {
    const handler = (data) => {
      console.log("📡 New notification received via socket:", data);
      setNotifications((prev) => [data, ...prev]);
    };

    socket.on("new_notification", handler);
    return () => socket.off("new_notification", handler);
  }, []);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.title}>Notifications</Text>
        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={globalStyles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => String(item.id || index)}
            renderItem={({ item }) => <NotificationItem notification={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchNotifications}
              />
            }
            ListEmptyComponent={
              <Text style={globalStyles.emptyStateText}>
                No new notifications.
              </Text>
            }
            contentContainerStyle={
              notifications.length === 0 && {
                flexGrow: 1,
                justifyContent: "center",
              }
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    marginBottom: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  unreadNotification: {
    backgroundColor: COLORS.white,
  },
  readNotification: {
    backgroundColor: COLORS.background,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: COLORS.darkGrey,
    marginTop: 5,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
});

export default NotificationScreen;
