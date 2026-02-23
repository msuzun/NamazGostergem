/**
 * SensorService — Accelerometer at ~50Hz with low-pass filtering.
 *
 * Why low-pass: Raw accelerometer data is noisy. A simple one-pole low-pass
 * filter (y[n] = alpha * x[n] + (1 - alpha) * y[n-1]) smooths high-frequency
 * noise while keeping orientation/gravity response usable for posture detection.
 *
 * Expected sample rate: ~50Hz (update interval 20ms). This balances
 * responsiveness with CPU and battery usage.
 *
 * Battery: 50Hz sampling consumes noticeable power. Only enable the
 * accelerometer during the active prayer session (sessionStatus === RUNNING)
 * and stop it when the session is paused, ended, or the screen unmounts.
 */

import { Accelerometer } from 'expo-sensors';

export type AccelerometerSample = {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  raw: { x: number; y: number; z: number };
};

export type SensorCallback = (sample: AccelerometerSample) => void;

const ALPHA = 0.2;
// y[n] = alpha * x[n] + (1 - alpha) * y[n-1]
function lowPass(prev: number, next: number): number {
  return ALPHA * next + (1 - ALPHA) * prev;
}

let subscription: { remove: () => void } | null = null;
let filterState: { x: number; y: number; z: number } | null = null;

function initFilterState(x: number, y: number, z: number): { x: number; y: number; z: number } {
  if (filterState === null) {
    filterState = { x, y, z };
    return filterState;
  }
  filterState.x = lowPass(filterState.x, x);
  filterState.y = lowPass(filterState.y, y);
  filterState.z = lowPass(filterState.z, z);
  return filterState;
}

/**
 * Starts accelerometer sampling at ~50Hz (intervalMs defaults to 20).
 * Applies a simple low-pass filter to x/y/z and passes filtered sample + magnitude to cb.
 * Returns a stop function that unsubscribes and resets state.
 */
export function startAccelerometer(
  cb: SensorCallback,
  options?: { intervalMs?: number }
): () => void {
  const intervalMs = options?.intervalMs ?? 20;
  Accelerometer.setUpdateInterval(intervalMs);

  if (subscription) {
    subscription.remove();
    subscription = null;
    filterState = null;
  }

  subscription = Accelerometer.addListener((event) => {
    const { x, y, z } = event;
    const filtered = initFilterState(x, y, z);
    const magnitude = Math.sqrt(
      filtered.x * filtered.x + filtered.y * filtered.y + filtered.z * filtered.z
    );
    cb({
      x: filtered.x,
      y: filtered.y,
      z: filtered.z,
      magnitude,
      raw: { x, y, z }
    });
  });

  return function stop() {
    if (subscription) {
      subscription.remove();
      subscription = null;
      filterState = null;
    }
  };
}

/**
 * Stops the accelerometer and resets internal state.
 * Safe to call multiple times; no-op if not running.
 */
export function stopAccelerometer(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  filterState = null;
}
