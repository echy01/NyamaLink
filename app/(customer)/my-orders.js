import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InfoCard from '../../components/InfoCard';
import api from '../api';
import COLORS from '../styles/colors';
import globalStyles from '../styles/globalStyles';

const ORDER_STATUSES = [
  'pending',
  'accepted',
  'processing',
  'ready_for_pickup',
  'dispatched',
  'arrived',
  'completed',
];

const PaymentStatusChip = ({ status }) => {
  const backgroundColor = {
    paid: COLORS.success,
    unpaid: COLORS.danger,
    pending: COLORS.warning,
    failed: COLORS.danger,
  }[status] || COLORS.border;

  return (
    <View style={[styles.paymentChip, { backgroundColor }]}>
      <Text style={styles.paymentChipText}>{(status || 'unpaid').toUpperCase()}</Text>
    </View>
  );
};

const CustomerMyOrdersScreen = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const router = useRouter();

  const fetchMyOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const myOrdersRes = await api.getMyCustomerOrders();
      setMyOrders(Array.isArray(myOrdersRes.data?.orders) ? myOrdersRes.data.orders : []);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (params?.refresh) {
        fetchMyOrders();
      }
    }, [params?.refresh])
  );

  const handlePayNow = async (order) => {
    try {
      const res = await api.initializePayment({
        amount: order.totalPrice,
        orderId: order._id,
      });

      if (res.data && res.data.paymentUrl) {
        router.push({
          pathname: '/payment/webview',
          params: {
            paymentUrl: res.data.paymentUrl,
          },
        });
      } else {
        Alert.alert('Error', 'Unable to get payment URL.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Payment Error', 'Could not start payment process.');
    }
  };

  const OrderStatusTracker = ({ currentStatus }) => {
    const currentIndex = ORDER_STATUSES.indexOf(currentStatus);

    return (
      <View style={styles.trackerContainer}>
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={status} style={styles.statusItem}>
              <View
                style={[
                  styles.statusCircle,
                  isCompleted ? styles.completed : isCurrent ? styles.current : styles.pending,
                ]}
              />
              <Text style={styles.statusLabel}>{status.replace(/_/g, ' ')}</Text>
              {index < ORDER_STATUSES.length - 1 && (
                <View style={styles.statusLine} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={myOrders}
            renderItem={({ item }) => {
              if (!item || !item._id) return null;

              const isUnpaid = item.paymentStatus?.status === 'unpaid';
              const createdDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown';

              return (
                <InfoCard
                  icon="receipt-outline"
                  title={`Order for ${String(item.meatType || 'N/A')}`}
                  value={`Quantity: ${String(item.quantity || '0')}kg | Total: KES ${String(item.totalPrice || '0')}`}
                  subtitle={`From: ${String(item.butcheryName || 'N/A')} | Ordered: ${createdDate}`}
                >
                  <OrderStatusTracker currentStatus={item.status} />
                  <PaymentStatusChip status={item.paymentStatus?.status} />
                  {isUnpaid && (
                    <TouchableOpacity
                      style={[globalStyles.button, { marginTop: 10 }]}
                      onPress={() => handlePayNow(item)}
                    >
                      <Text style={globalStyles.buttonText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </InfoCard>
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

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  trackerContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  statusLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.textLight,
    marginHorizontal: 2,
  },
  statusLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  completed: {
    backgroundColor: COLORS.success,
  },
  current: {
    backgroundColor: COLORS.primary,
  },
  pending: {
    backgroundColor: COLORS.border,
  },
  paymentChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  paymentChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default CustomerMyOrdersScreen;
