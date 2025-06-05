import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Dashboard() {
  const { role, name } = useLocalSearchParams(); 

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {name}!</Text>

      {role === 'customer' && (
        <Text style={styles.message}>This is the customer dashboard where you can browse and order meat.</Text>
      )}

      {role === 'butcher' && (
        <Text style={styles.message}>This is the butcher dashboard where you can manage stock and view orders.</Text>
      )}

      {role === 'agent' && (
        <Text style={styles.message}>This is the agent dashboard where you manage delivery logistics.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#088880',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
