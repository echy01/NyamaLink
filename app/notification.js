import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import socket from '../utils/socket'; // adjust path as needed

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('new_notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => socket.off('new_notification');
  }, []);

  const sendTestNotification = () => {
    socket.emit('trigger_test_notification');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📩 Real-time Notifications</Text>
      <Button title="Send Test Notification" onPress={sendTestNotification} />
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        notifications.map((note, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{note.title}</Text>
            <Text style={styles.cardMessage}>{note.message}</Text>
            <Text style={styles.cardTimestamp}>
              {new Date(note.timestamp).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  empty: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  cardTimestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
});
