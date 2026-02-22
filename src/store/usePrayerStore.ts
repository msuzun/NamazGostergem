import { create } from 'zustand';
import { getDefaultConfig, generatePattern } from '../utils/patternGenerator';
import { PrayerType, SessionStatus, type PrayerConfig } from '../types';

type PrayerStoreState = {
  selectedPrayer: PrayerType | null;
  prayerConfig: PrayerConfig | null;
  rakats: number;
  pattern: number[];
  sessionStatus: SessionStatus;
  currentRakatIndex: number;
  completedRakats: number;
  debug: boolean;
};

type PrayerStoreActions = {
  selectPrayer: (prayer: PrayerType) => void;
  setRakats: (n: number) => void;
  setPattern: (pattern: number[]) => void;
  setDebug: (enabled: boolean) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  advanceRakat: () => void;
  resetSession: () => void;
};

type PrayerStore = PrayerStoreState & PrayerStoreActions;

const clampRakats = (n: number) => Math.max(1, Math.floor(n));

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  selectedPrayer: null,
  prayerConfig: null,
  rakats: 0,
  pattern: [],
  sessionStatus: SessionStatus.IDLE,
  currentRakatIndex: 0,
  completedRakats: 0,
  debug: false,

  selectPrayer: (prayer) => {
    const config = getDefaultConfig(prayer);
    set({
      selectedPrayer: prayer,
      prayerConfig: config,
      rakats: config.defaultRakats,
      pattern: [...config.defaultPattern]
    });
  },

  setRakats: (n) =>
    set((state) => {
      const nextRakats = clampRakats(n);
      if (!state.prayerConfig) {
        return { rakats: nextRakats, pattern: state.pattern.slice(0, nextRakats) };
      }

      return {
        rakats: nextRakats,
        pattern: generatePattern(nextRakats, state.prayerConfig.patternPreset)
      };
    }),

  setPattern: (pattern) =>
    set({
      pattern: [...pattern]
    }),

  setDebug: (enabled) =>
    set({
      debug: enabled
    }),

  startSession: () =>
    set({
      sessionStatus: SessionStatus.RUNNING,
      currentRakatIndex: 0,
      completedRakats: 0
    }),

  pauseSession: () =>
    set({
      sessionStatus: SessionStatus.PAUSED
    }),

  resumeSession: () =>
    set({
      sessionStatus: SessionStatus.RUNNING
    }),

  endSession: () =>
    set({
      sessionStatus: SessionStatus.ENDED
    }),

  advanceRakat: () => {
    const state = get();
    const nextIndex = state.currentRakatIndex + 1;
    const nextCompleted = state.completedRakats + 1;

    set({
      currentRakatIndex: nextIndex,
      completedRakats: nextCompleted
    });

    if (nextIndex >= state.rakats) {
      get().endSession();
    }
  },

  resetSession: () =>
    set({
      sessionStatus: SessionStatus.IDLE,
      currentRakatIndex: 0,
      completedRakats: 0
    })
}));

