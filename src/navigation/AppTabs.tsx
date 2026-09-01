import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import MindsetScreen from '../screens/MindsetScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: '#0F172A',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Daily Budget',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 20 : 18 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: 'AI Smart Log',
          tabBarLabel: 'Smart Log',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 20 : 18 }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Mindset"
        component={MindsetScreen}
        options={{
          title: 'Mindset & Wishlist',
          tabBarLabel: 'Mindset',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 20 : 18 }}>🧠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionScreen}
        options={{
          title: 'Subscription Graveyard',
          tabBarLabel: 'Subs',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 20 : 18 }}>⚰️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Forecast & Habits',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 20 : 18 }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
