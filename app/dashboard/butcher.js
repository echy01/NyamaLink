import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ButcherDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Butcher Dashboard</Text>
      <Text style={styles.message}>Manage stock and view orders.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#cc0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
    