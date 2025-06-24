import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors'; 
import { Text } from 'react-native'; 

const getHeaderTitle = (route) => {
  switch (route.name) {
    case 'index': 
      return 'Butcher Home';
    case 'inventory':
      return 'My Inventory';
    case 'customer-orders':
      return 'Customer Orders';
    case 'purchase':
      return 'Purchase Meat';
    case 'profile':
      return 'Butcher Profile';
    default:
      return 'Butcher Dashboard';
  }
};

const ButcherLayout = () => {
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
          } else if (route.name === 'customer-orders') {
            iconName = 'receipt-outline';
          } else if (route.name === 'purchase') {
            iconName = 'cart-outline';
          } else if (route.name === 'profile') {
            iconName = 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Home', 
          headerTitle: 'Butcher Overview',
        }}
      />
      <Tabs.Screen
        name="inventory" 
        options={{
          title: 'Inventory',
          headerTitle: 'My Meat Stock',
        }}
      />
      <Tabs.Screen
        name="customer-orders" 
        options={{
          title: 'Orders',
          headerTitle: 'Customer Orders',
        }}
      />
      <Tabs.Screen
        name="purchase" 
        options={{
          title: 'Purchase',
          headerTitle: 'Buy from Slaughterhouse',
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

export default ButcherLayout;
