import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';

// Main Tab Navigation
import MainTabNavigator from './MainTabNavigator';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Flow
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
        </>
      ) : (
        // Main App
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
