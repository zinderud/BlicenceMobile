import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../store';
import DashboardScreen from '../screens/main/DashboardScreen';
import PlansScreen from '../screens/main/PlansScreen';
import MarketplaceScreen from '../screens/main/MarketplaceScreen';
import NFTScreen from '../screens/main/NFTScreen';
import QRTestScreen from '../screens/test/QRTestScreen';
import NotificationTestScreen from '../screens/test/NotificationTestScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen} 
        options={{ 
          title: 'Planlarım',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="list" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="NFTs" 
        component={NFTScreen} 
        options={{ 
          title: 'NFT\'lerim',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="nft" color={color} size={size} />
          ),
        }} 
      />
      {user?.userType === 'customer' && (
        <Tab.Screen 
          name="Marketplace" 
          component={MarketplaceScreen} 
          options={{ 
            title: 'Marketplace',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="shop" color={color} size={size} />
            ),
          }} 
        />
      )}
      <Tab.Screen 
        name="QRTest" 
        component={QRTestScreen} 
        options={{ 
          title: 'QR Test',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="qr" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="NotificationTest" 
        component={NotificationTestScreen} 
        options={{ 
          title: 'Bildirim Test',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bell" color={color} size={size} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

// Simple icon component - will be replaced with proper icons later
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({ name, color, size }) => {
  return (
    <View style={{ 
      width: size, 
      height: size, 
      backgroundColor: color, 
      borderRadius: size/2 
    }} />
  );
};

export default MainTabNavigator;
