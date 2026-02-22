import { useEffect, useRef, useState } from 'react';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { usePrayerStore } from '../store/usePrayerStore';
import { RakatMotionDetector } from '../services/sensor/rakatStateMachine';
import { dimScreenForSession, restoreBrightnessAfterSession } from '../services/brightness';
import { triggerStrongVibration } from '../services/haptics';

export function useSessionController() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const detectorRef = useRef(new RakatMotionDetector());
  const accelSubRef = useRef<{ remove: () => void } | null>(null);

  const prayers = usePrayerStore((s) => s.prayers);
  const session = usePrayerStore((s) => s.session);
  const startCountdownStore = usePrayerStore((s) => s.startCountdown);
  const startSessionStore = usePrayerStore((s) => s.startSession);
  const incrementRakat = usePrayerStore((s) => s.incrementRakat);
  const finishSession = usePrayerStore((s) => s.finishSession);
  const resetSession = usePrayerStore((s) => s.resetSession);

  const selectedPrayer = prayers.find((p) => p.id === session.selectedPrayerId) ?? prayers[0];

  const stopSensors = () => {
    accelSubRef.current?.remove();
    accelSubRef.current = null;
    detectorRef.current.reset();
  };

  const startSensors = () => {
    Accelerometer.setUpdateInterval(20); // ~50Hz
    accelSubRef.current = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      const events = detectorRef.current.update({
        x: data.x,
        y: data.y,
        z: data.z,
        timestamp: Date.now()
      });

      for (const evt of events) {
        if (evt.type !== 'RAKAT_RISE_FROM_SUJUD2') continue;

        const currentIndex = usePrayerStore.getState().session.currentRakatIndex;
        const prayer = usePrayerStore.getState().prayers.find(
          (p) => p.id === usePrayerStore.getState().session.selectedPrayerId
        );

        if (!prayer) return;

        const patternValue = prayer.pattern[currentIndex];

        if (patternValue === 0) {
          triggerStrongVibration();
        }

        usePrayerStore.getState().incrementRakat();

        const nextIndex = usePrayerStore.getState().session.currentRakatIndex;
        if (nextIndex >= prayer.rakatCount) {
          void endSession();
        }
      }
    });
  };

  const beginSessionFlow = async () => {
    startCountdownStore();
    setCountdown(3);

    let value = 3;
    const interval = setInterval(() => {
      value -= 1;
      setCountdown(value > 0 ? value : null);

      if (value <= 0) {
        clearInterval(interval);
        void (async () => {
          await dimScreenForSession();
          detectorRef.current.reset();
          startSessionStore();
          startSensors();
        })();
      }
    }, 1000);
  };

  const endSession = async () => {
    stopSensors();
    await restoreBrightnessAfterSession();
    finishSession();
  };

  const abortAndReset = async () => {
    stopSensors();
    await restoreBrightnessAfterSession();
    resetSession();
    setCountdown(null);
  };

  useEffect(() => {
    return () => {
      stopSensors();
      void restoreBrightnessAfterSession();
    };
  }, []);

  return {
    countdown,
    session,
    selectedPrayer,
    beginSessionFlow,
    endSession,
    abortAndReset
  };
}
