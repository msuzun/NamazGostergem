import type { MutableRefObject } from 'react';
import { useRef, useCallback } from 'react';
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { stopAccelerometer } from '../services/sensorService';
import { restoreDndAfterSession } from '../services/dndService';
import { usePrayerStore } from '../store/usePrayerStore';

export type TeardownRefs = {
  prevBrightness: MutableRefObject<number>;
  fsmReset: () => void;
};

/**
 * Teardown order matters:
 * 1. Stop sensors first — no more data after this.
 * 2. Reset FSM — clear internal state.
 * 3. Release wakelock — screen can sleep again.
 * 4. Restore DND — user's audio state is restored.
 * 5. Restore brightness — screen returns to normal.
 * 6. Reset store last — UI can now react to IDLE state.
 */
export function useSessionTeardown(refs: TeardownRefs): { teardown: () => Promise<void> } {
  const torn = useRef(false);
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const resetSession = usePrayerStore((state) => state.resetSession);

  const teardown = useCallback(async () => {
    if (torn.current) return;
    torn.current = true;

    const { prevBrightness, fsmReset } = refsRef.current;

    stopAccelerometer();
    fsmReset();
    deactivateKeepAwake();

    await restoreDndAfterSession();

    try {
      await Brightness.setBrightnessAsync(prevBrightness.current);
    } catch {
      // iOS may restrict brightness control — ignore
    }

    resetSession();
  }, [resetSession]);

  return { teardown };
}
