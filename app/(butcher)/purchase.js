// Updated butcher purchase screen with PaymentStatusChip to fix [object Object] display
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../styles/globalStyles'; 
import InfoCard from '../../components/InfoCard';    
import api from '../api';                        
import COLORS from '../styles/colors';

const PaymentStatusChip = ({ status }) => {
  const backgroundColor = {
    paid: COLORS.success,
    unpaid: COLORS.danger,
    pending: COLORS.warning,
    failed: COLORS.danger,
  }[status] || COLORS.border;

  return (
    <View style={localStyles.paymentChip}>
      <Text style={[localStyles.paymentChipText, { backgroundColor }]}>{(status || 'unpaid').toUpperCase()}</Text>
    </View>
  );
};

const ButcherPurchaseScreen = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchPurchaseOrders = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const res = await api.getMySlaughterhouseOrders();
      setPurchaseOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch (err) {
      console.error('❌ Load Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to load purchase orders.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleInitiatePayment = async (order) => {
    try {
      const res = await api.initializePayment({
        amount: order.totalPrice,
        orderId: order._id,
        email: order.butcherEmail || 'youremail@fallback.com',
      });

      if (res.data?.paymentUrl) {
        navigation.navigate('payment/webview', {
          paymentUrl: res.data.paymentUrl,
        });
      } else {
        Alert.alert('Payment Error', 'Payment URL not found.');
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert('Payment Error', 'Could not initiate payment.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={localStyles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={purchaseOrders}
            renderItem={({ item }) => (
              <InfoCard
                icon="basket-outline"
                title={`Slaughterhouse: ${item.slaughterhouseName}`}
                value={`Ordered: ${item.meatType} | Qty: ${item.quantity}kg`}
                subtitle={`Status: ${item.status}\nTotal: KES ${item.totalPrice} | Placed: ${new Date(item.createdAt).toLocaleDateString()}`}
              >
                <PaymentStatusChip status={item.paymentStatus?.status} />
                <View style={localStyles.cardActions}>
                  {item.paymentStatus?.status !== 'paid' && (
                    <TouchableOpacity
                      style={[globalStyles.button, localStyles.smallActionButton]}
                      onPress={() => handleInitiatePayment(item)}
                    >
                      <Text style={globalStyles.buttonText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </InfoCard>
            )}
            keyExtractor={(item) => String(item._id)}
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
    paddingTop: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  smallActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  paymentChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  paymentChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

export default ButcherPurchaseScreen;
