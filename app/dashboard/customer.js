import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CustomerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Customer Dashboard</Text>
      <Text style={styles.message}>Browse and order fresh meat conveniently!</Text>
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
