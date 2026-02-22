import * as Haptics from 'expo-haptics';
import { Vibration, Platform } from 'react-native';

export async function triggerStrongVibration() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Fallback
  }

  // Explicit vibration duration for Android / fallback behavior.
  if (Platform.OS === 'android') {
    Vibration.vibrate(500);
  } else {
    Vibration.vibrate();
  }
}
