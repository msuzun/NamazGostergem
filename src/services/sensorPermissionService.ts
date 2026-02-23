/**
 * Sensor permission and availability checks for motion (accelerometer).
 * Used to show in-app permission overlay on SessionScreen when required (e.g. iOS).
 */

import { Accelerometer } from 'expo-sensors';

export type SensorPermissionStatus =
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'undetermined';

export async function checkSensorPermission(): Promise<SensorPermissionStatus> {
  try {
    const available = await Accelerometer.isAvailableAsync();
    if (!available) return 'unavailable';

    const getPerms = (Accelerometer as { getPermissionsAsync?: () => Promise<{ status: string }> })
      .getPermissionsAsync;
    if (typeof getPerms !== 'function') return 'granted'; // Android often has no explicit permission

    const { status } = await getPerms();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}

export async function requestSensorPermission(): Promise<SensorPermissionStatus> {
  try {
    const requestPerms = (Accelerometer as { requestPermissionsAsync?: () => Promise<{ status: string }> })
      .requestPermissionsAsync;
    if (typeof requestPerms !== 'function') return (await checkSensorPermission());

    const { status } = await requestPerms();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}
