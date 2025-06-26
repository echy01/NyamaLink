import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import COLORS from '../styles/colors';

const PaymentWebView = () => {
  const { paymentUrl } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {paymentUrl ? (
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('payment-success')) {
              navigation.navigate('customer/my-orders', { refresh: true });
            }
            if (navState.url.includes('payment-failed')) {
              navigation.goBack(); // or show a failed screen
            }
          }}
        />
      ) : (
        <ActivityIndicator size="large" color={COLORS.primary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PaymentWebView;
