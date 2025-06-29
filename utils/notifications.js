import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set default behavior for received notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,       // Show banner alert
    shouldPlaySound: true,       // Play notification sound
    shouldSetBadge: false,       // Don’t set badge count on app icon
  }),
});

// Register and get Expo push token
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Must use a physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  console.log('✅ Expo Push Token:', token);

  return token;
}

// Set up foreground and tap listeners
export function setupNotificationListeners(onReceive, onRespond) {
  const subscription1 = Notifications.addNotificationReceivedListener(onReceive);
  const subscription2 = Notifications.addNotificationResponseReceivedListener(onRespond);

  // Return cleanup function to remove listeners
  return () => {
    subscription1.remove();
    subscription2.remove();
  };
}
