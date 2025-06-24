import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../styles/colors'; 
import { Text } from 'react-native'; 

const CustomerLayout = () => {
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
            iconName = 'basket-outline'; 
          } else if (route.name === 'my-orders') {
            iconName = 'list-outline'; 
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
          title: 'Browse Meat',
          headerTitle: 'Available Meat', 
        }}
      />
      <Tabs.Screen
        name="my-orders" 
        options={{
          title: 'My Orders',
          headerTitle: 'Your Order History',
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

export default CustomerLayout;
