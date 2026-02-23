import { useState, useEffect } from 'react';
import {
  startAccelerometer,
  stopAccelerometer,
  type AccelerometerSample
} from '../services/sensorService';

/**
 * Wraps the accelerometer service in a React hook.
 * When enabled is true, subscribes at ~50Hz (20ms). On error or unavailable sensor,
 * sets error message for in-app fallback (e.g. visual counter only).
 */
export function useAccelerometer(
  enabled: boolean,
  _debug: boolean
): { sample: AccelerometerSample | null; error: string | null } {
  const [sample, setSample] = useState<AccelerometerSample | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSample(null);
      setError(null);
      stopAccelerometer();
      return;
    }

    setError(null);
    try {
      const stop = startAccelerometer((s) => {
        setSample(s);
      }, { intervalMs: 20 });

      return () => {
        stop();
        stopAccelerometer();
        setSample(null);
        setError(null);
      };
    } catch (e) {
      if (__DEV__) console.error('Accelerometer error:', e);
      setError('Hareket sensörü başlatılamadı');
      setSample(null);
      return () => {
        stopAccelerometer();
      };
    }
  }, [enabled]);

  return { sample, error };
}
