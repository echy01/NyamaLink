// app/(butcher)/_layout.js

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors';

const ButcherLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => {
        let iconName;

        switch (route.name) {
          case 'index':
            iconName = 'home-outline';
            break;
          case 'inventory':
            iconName = 'cube-outline';
            break;
          case 'customer-orders':
            iconName = 'receipt-outline';
            break;
          case 'purchase':
            iconName = 'cart-outline';
            break;
          case 'profile':
            iconName = 'person-outline';
            break;
          default:
            iconName = 'alert-circle-outline';
        }

        return {
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={size} color={color} />
          ),
        };
      }}
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
