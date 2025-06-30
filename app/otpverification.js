import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import COLORS from './styles/colors';
import api from './api';

export default function OTPVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    phoneNumber,
    name,
    email,
    password,
    role
  } = params;

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await api.verifyOtp({ phoneNumber, code });

      await api.signup({
        name,
        email,
        phoneNumber,
        password,
        role,
      });

      Alert.alert('Success', 'Account created successfully! Please log in.');
      router.replace('/loginscreen');
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const response = await api.sendOtp({ phoneNumber });
      if (response.data.message === 'OTP sent successfully.') {
        Alert.alert('OTP Sent', 'A new verification code has been sent.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phoneNumber}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOtp} disabled={resending} style={{ marginTop: 20 }}>
        <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>
          {resending ? 'Resending...' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: COLORS.textLight,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: COLORS.white,
    width: '100%',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
