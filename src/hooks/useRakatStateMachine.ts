import { useState, useRef, useEffect, useCallback } from 'react';
import type { AccelerometerSample } from '../services/sensorService';
import { extractFeatures } from '../algorithms/features';
import { createRakatStateMachine, RakatState, type RakatEvent } from '../algorithms/rakatStateMachine';
import { usePrayerStore } from '../store/usePrayerStore';
import { triggerPatternVibration } from '../services/vibrationService';
import { useAccelerometer } from './useAccelerometer';

const MAX_DEBUG_LOGS = 10;

// We use getState() inside the FSM event callback instead of reactive Zustand state
// to avoid stale closure issues — the callback is created once and not re-created
// on every render, so it must read the latest store at event time.

export function useRakatStateMachine(enabled: boolean): {
  currentFsmState: RakatState;
  debugLogs: string[];
  lastVibrationReason: string | null;
  lastSample: AccelerometerSample | null;
  lastPitch: number | null;
  sensorError: string | null;
  resetFsm: () => void;
} {
  const debug = usePrayerStore((state) => state.debug);
  const thresholds = usePrayerStore((state) => state.thresholds);

  const { sample, error: sensorError } = useAccelerometer(enabled, debug);

  const [currentFsmState, setCurrentFsmState] = useState<RakatState>(RakatState.STANDING);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [lastVibrationReason, setLastVibrationReasonState] = useState<string | null>(null);
  const [lastPitch, setLastPitch] = useState<number | null>(null);

  const machineRef = useRef<ReturnType<typeof createRakatStateMachine> | null>(null);

  function setLastVibrationReason(reason: string | null) {
    setLastVibrationReasonState(reason);
    if (reason !== null) {
      setTimeout(() => setLastVibrationReasonState(null), 3000);
    }
  }

  useEffect(() => {
    if (!enabled) {
      if (machineRef.current) {
        machineRef.current.reset();
        machineRef.current = null;
      }
      setCurrentFsmState(RakatState.STANDING);
      setDebugLogs([]);
      setLastVibrationReasonState(null);
      setLastPitch(null);
      return;
    }

    machineRef.current = createRakatStateMachine({
      debug,
      thresholds,
      onEvent: (event: RakatEvent) => {
        if (event.type === 'RAKAT_COMPLETED') {
          const { pattern, currentRakatIndex, advanceRakat } = usePrayerStore.getState();
          const patternValue = pattern[currentRakatIndex] ?? 1;

          if (patternValue === 0) {
            triggerPatternVibration();
            setLastVibrationReason(`R${currentRakatIndex + 1}: Otur (pattern=0)`);
          } else {
            setLastVibrationReason(null);
          }
          advanceRakat();
        } else if (event.type === 'STATE_CHANGED') {
          setCurrentFsmState(event.to);
        } else if (event.type === 'DEBUG_LOG' && debug) {
          setDebugLogs((prev) => [...prev.slice(-(MAX_DEBUG_LOGS - 1)), event.message]);
        }
      }
    });

    return () => {
      machineRef.current?.reset();
      machineRef.current = null;
    };
  }, [enabled, debug]);

  useEffect(() => {
    if (!enabled || !sample || !machineRef.current) return;
    machineRef.current.feed(sample);
    const features = extractFeatures(sample);
    setLastPitch(features.pitch);
  }, [enabled, sample]);

  const resetFsm = useCallback(() => {
    machineRef.current?.reset();
  }, []);

  return {
    currentFsmState,
    debugLogs,
    lastVibrationReason,
    lastSample: sample,
    lastPitch,
    sensorError,
    resetFsm
  };
}
