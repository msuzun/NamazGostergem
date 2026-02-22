import { Accelerometer } from 'expo-sensors';

export type SensorSubscription = { remove: () => void } | null;

export const sensorService = {
  setSamplingRate(ms = 20) {
    Accelerometer.setUpdateInterval(ms);
  },
  start() {
    // Placeholder: actual motion processing will be implemented later.
    return Accelerometer.addListener(() => {
      // no-op
    });
  },
  stop(subscription: SensorSubscription) {
    subscription?.remove();
  }
};
