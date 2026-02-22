import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import DebugScreen from '../screens/DebugScreen';
import HomeScreen from '../screens/HomeScreen';
import SessionScreen from '../screens/SessionScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'NamazGostergem' }} />
      <Stack.Screen name="Session" component={SessionScreen} options={{ title: 'Session' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="Debug" component={DebugScreen} options={{ title: 'Debug' }} />
    </Stack.Navigator>
  );
}

