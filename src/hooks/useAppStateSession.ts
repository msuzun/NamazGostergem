import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Listens to AppState and calls onBackground when app goes to background or inactive,
 * and onForeground when app becomes active again.
 * 'inactive' occurs on iOS during phone calls, control center swipe, etc.
 * We treat it the same as 'background' for safety.
 * 'active' means app is fully in foreground again.
 */
export function useAppStateSession(options: {
  onBackground: () => void;
  onForeground: () => void;
}): void {
  const { onBackground, onForeground } = options;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        onBackground();
      } else if (nextState === 'active') {
        onForeground();
      }
    });

    return () => subscription.remove();
  }, [onBackground, onForeground]);
}
