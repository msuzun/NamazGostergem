/**
 * Do Not Disturb (DND) helper for session start/end.
 *
 * NOTE: With Expo managed workflow, we cannot directly toggle DND.
 * We only guide the user to system settings. If you eject / use a
 * custom dev client with a native module, you can change this.
 */

import { Platform } from 'react-native';

export type DndCapability = 'FULL_CONTROL' | 'SETTINGS_ONLY' | 'UNSUPPORTED';

/**
 * Returns the DND capability for the current platform.
 * Expo managed: Android → SETTINGS_ONLY, others → UNSUPPORTED.
 */
export function getDndCapability(): DndCapability {
  if (Platform.OS !== 'android') {
    return 'UNSUPPORTED';
  }
  return 'SETTINGS_ONLY';
}

/**
 * Called when a prayer session is about to start.
 * Does not toggle DND programmatically in Expo managed workflow.
 */
export async function ensureDndForSessionStart(): Promise<{
  enabled: boolean;
  requiresUserAction: boolean;
}> {
  if (Platform.OS === 'android') {
    return { enabled: false, requiresUserAction: true };
  }
  // iOS: DND cannot be changed automatically by the app
  return { enabled: false, requiresUserAction: true };
}

/**
 * Called when the session ends.
 * In a future native-enabled version, you would restore the previous
 * interruption filter here. For now, we rely on the user.
 */
export async function restoreDndAfterSession(): Promise<void> {
  // No-op for Expo managed — we didn't set DND, so nothing to restore.
}
