import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import CalibrationScreen from '../screens/CalibrationScreen';
import DebugScreen from '../screens/DebugScreen';
import HomeScreen from '../screens/HomeScreen';
import ReplayScreen from '../screens/ReplayScreen';
import SessionSetupScreen from '../screens/SessionSetupScreen';
import SessionScreen from '../screens/SessionScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ contentStyle: { backgroundColor: '#0f0f0f' } }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Stack.Screen
        name="SessionSetup"
        component={SessionSetupScreen}
        options={{ title: 'Oturum Ayarları' }}
      />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={{
          title: '',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ayarlar' }}
      />
      <Stack.Screen
        name="Calibration"
        component={CalibrationScreen}
        options={{ title: 'Kalibrasyon' }}
      />
      <Stack.Screen
        name="Replay"
        component={ReplayScreen}
        options={{ title: 'Tekrar / Simülasyon' }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{ title: 'Hata Ayıklama' }}
      />
    </Stack.Navigator>
  );
}
