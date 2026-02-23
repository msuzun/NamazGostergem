/**
 * JS-only helpers to open platform settings (DND / notification related).
 * Expo managed: we cannot open Android intent actions directly; we try URL candidates
 * and fall back to generic app/system settings.
 */

import { Platform, Linking } from 'react-native';

/**
 * Tries to open Notification Policy / DND-related settings on Android.
 * Falls back to general settings if specific screens are not available.
 */
export async function openAndroidDndSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const urlCandidates = [
    'android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS',
    'android.settings.SOUND_SETTINGS',
    'android.settings.SETTINGS'
  ];

  for (const action of urlCandidates) {
    const url = `android-app://${action}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // ignore and try next
    }
  }

  await Linking.openSettings();
}

/**
 * Opens the app's settings on iOS (or system settings).
 */
export async function openIosSettings(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    await Linking.openSettings();
  } catch {
    // no-op
  }
}
