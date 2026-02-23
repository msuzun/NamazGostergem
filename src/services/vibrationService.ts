/**
 * Vibration / haptic feedback for rakat cues.
 *
 * Android: Vibration.vibrate(ms) triggers a single vibration of given duration.
 * No native module needed — RN's Vibration API supports duration on Android.
 *
 * iOS: expo-haptics does not support arbitrary duration.
 * We simulate ~500ms with 3 heavy impacts. This is the best available on iOS
 * without a custom native module.
 */

import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Main entry point — call this when pattern[i] === 0 (sit signal).
 * Branches on platform; catches errors so the session never crashes.
 */
export async function triggerPatternVibration(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(500);
    } else {
      await vibrateStrong();
    }
  } catch (e) {
    if (__DEV__) {
      console.warn('[vibrationService] triggerPatternVibration failed:', e);
    }
  }
}

/**
 * Strong single vibration: 500ms on Android, 3× Heavy impact on iOS (~500ms total).
 */
export async function vibrateStrong(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(500);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await sleep(150);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await sleep(150);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (e) {
    if (__DEV__) {
      console.warn('[vibrationService] vibrateStrong failed:', e);
    }
  }
}

/**
 * Light confirmation tap — for debug/test only.
 */
export async function vibrateLight(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(80);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (e) {
    if (__DEV__) {
      console.warn('[vibrationService] vibrateLight failed:', e);
    }
  }
}
