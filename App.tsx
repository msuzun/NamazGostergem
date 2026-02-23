import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { usePrayerStore } from './src/store/usePrayerStore';

export default function App() {
  useEffect(() => {
    usePrayerStore.getState().loadThresholdsFromStorage();
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
