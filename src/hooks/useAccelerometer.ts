import { useState, useEffect } from 'react';
import {
  startAccelerometer,
  stopAccelerometer,
  type AccelerometerSample
} from '../services/sensorService';

/**
 * Wraps the accelerometer service in a React hook.
 * When enabled is true, subscribes at ~50Hz (20ms) and updates sample state.
 * When enabled is false or on unmount, stops the sensor and clears sample.
 */
export function useAccelerometer(enabled: boolean, _debug: boolean): AccelerometerSample | null {
  const [sample, setSample] = useState<AccelerometerSample | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSample(null);
      stopAccelerometer();
      return;
    }

    const stop = startAccelerometer((s) => {
      setSample(s);
    }, { intervalMs: 20 });

    return () => {
      stop();
      stopAccelerometer();
      setSample(null);
    };
  }, [enabled]);

  return sample;
}
