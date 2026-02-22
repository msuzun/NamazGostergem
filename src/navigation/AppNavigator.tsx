import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import PrayerConfigScreen from '../screens/PrayerConfigScreen';
import SessionScreen from '../screens/SessionScreen';
import InfoScreen from '../screens/InfoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'NamazGostergem' }} />
      <Stack.Screen name="PrayerConfig" component={PrayerConfigScreen} options={{ title: 'Prayer Config' }} />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={{
          title: 'Session',
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen name="Info" component={InfoScreen} options={{ title: 'Info / DND' }} />
    </Stack.Navigator>
  );
}
