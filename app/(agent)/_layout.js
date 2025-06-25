import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors';
import { Text } from 'react-native';

const AgentLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          color: COLORS.textDark,
          fontWeight: '600',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home-outline';
          } else if (route.name === 'inventory') {
            iconName = 'cube-outline';
          } else if (route.name === 'orders') {
            iconName = 'receipt-outline';
          } else if (route.name === 'butchers') {
            iconName = 'people-outline';
          } else if (route.name === 'purchases') {
            iconName = 'swap-horizontal-outline';
          } else if (route.name === 'profile') {
            iconName = 'person-outline';
          }
          // Ensure a default icon name is provided if none of the above match
          return <Ionicons name={iconName || 'alert-circle-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Agent Overview',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          headerTitle: 'Slaughterhouse Stock',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Butcher Orders',
          headerTitle: 'Orders from Butchers',
        }}
      />
      <Tabs.Screen
        name="butchers"
        options={{
          title: 'Butchers',
          headerTitle: 'Registered Butchers',
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: 'My Purchases',
          headerTitle: 'My Supply Orders',
        }}
      />
       <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
};

export default AgentLayout;
