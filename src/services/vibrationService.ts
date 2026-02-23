/**
 * Vibration / haptic feedback for rakat cues.
 *
 * Note: expo-haptics does not support arbitrary duration vibration.
 * On Android, Vibration API from react-native can be used for precise duration:
 *   import { Vibration } from 'react-native';
 *   Vibration.vibrate(500);
 * Use Vibration.vibrate for pattern[i] === 0 case on Android for best effect.
 */

import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function vibrateStrong(): Promise<void> {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await delay(150);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await delay(150);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function vibratePlatform(): void {
  if (Platform.OS === 'android') {
    Vibration.vibrate(500);
  } else {
    vibrateStrong();
  }
}
