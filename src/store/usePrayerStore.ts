import { create } from 'zustand';
import type { PrayerConfig, PatternValue, SessionStatus } from '../types';

type SessionData = {
  status: SessionStatus;
  selectedPrayerId: string | null;
  currentRakatIndex: number; // 0-based
  lastDetectedAt: number | null;
  dndNoticeAcknowledged: boolean;
};

type PrayerStore = {
  prayers: PrayerConfig[];
  session: SessionData;
  selectPrayer: (prayerId: string) => void;
  updatePrayerRakatCount: (prayerId: string, rakatCount: number) => void;
  togglePatternValue: (prayerId: string, index: number) => void;
  setPatternValue: (prayerId: string, index: number, value: PatternValue) => void;
  startCountdown: () => void;
  startSession: () => void;
  incrementRakat: () => void;
  finishSession: () => void;
  resetSession: () => void;
  setDndNoticeAcknowledged: (value: boolean) => void;
};

const makeAlternatingPattern = (count: number): PatternValue[] =>
  Array.from({ length: count }, (_, i) => (i % 2 === 0 ? 1 : 0));

const clampCount = (value: number) => Math.max(1, Math.min(40, value));

const defaultPrayers: PrayerConfig[] = [
  { id: 'sabah', name: 'Sabah', rakatCount: 2, pattern: [1, 0] },
  { id: 'ogle', name: 'Öğle', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'ikindi', name: 'İkindi', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'aksam', name: 'Akşam', rakatCount: 3, pattern: [1, 0, 0] },
  { id: 'yatsi', name: 'Yatsı', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'teravih', name: 'Teravih', rakatCount: 8, pattern: makeAlternatingPattern(8) }
];

export const usePrayerStore = create<PrayerStore>((set, get) => ({
  prayers: defaultPrayers,
  session: {
    status: 'idle',
    selectedPrayerId: defaultPrayers[0].id,
    currentRakatIndex: 0,
    lastDetectedAt: null,
    dndNoticeAcknowledged: false
  },

  selectPrayer: (prayerId) =>
    set((state) => ({
      session: { ...state.session, selectedPrayerId: prayerId }
    })),

  updatePrayerRakatCount: (prayerId, nextCountRaw) =>
    set((state) => {
      const nextCount = clampCount(nextCountRaw);
      return {
        prayers: state.prayers.map((p) => {
          if (p.id !== prayerId) return p;
          const nextPattern = [...p.pattern];
          if (nextPattern.length < nextCount) {
            nextPattern.push(...makeAlternatingPattern(nextCount - nextPattern.length));
          }
          return {
            ...p,
            rakatCount: nextCount,
            pattern: nextPattern.slice(0, nextCount) as PatternValue[]
          };
        })
      };
    }),

  togglePatternValue: (prayerId, index) =>
    set((state) => ({
      prayers: state.prayers.map((p) =>
        p.id !== prayerId
          ? p
          : {
              ...p,
              pattern: p.pattern.map((v, i) => (i === index ? ((v === 1 ? 0 : 1) as PatternValue) : v))
            }
      )
    })),

  setPatternValue: (prayerId, index, value) =>
    set((state) => ({
      prayers: state.prayers.map((p) =>
        p.id !== prayerId ? p : { ...p, pattern: p.pattern.map((v, i) => (i === index ? value : v)) }
      )
    })),

  startCountdown: () =>
    set((state) => ({
      session: { ...state.session, status: 'countdown', currentRakatIndex: 0, lastDetectedAt: null }
    })),

  startSession: () =>
    set((state) => ({
      session: { ...state.session, status: 'running', currentRakatIndex: 0, lastDetectedAt: null }
    })),

  incrementRakat: () =>
    set((state) => ({
      session: {
        ...state.session,
        currentRakatIndex: state.session.currentRakatIndex + 1,
        lastDetectedAt: Date.now()
      }
    })),

  finishSession: () =>
    set((state) => ({
      session: { ...state.session, status: 'finished' }
    })),

  resetSession: () =>
    set((state) => ({
      session: { ...state.session, status: 'idle', currentRakatIndex: 0, lastDetectedAt: null }
    })),

  setDndNoticeAcknowledged: (value) =>
    set((state) => ({
      session: { ...state.session, dndNoticeAcknowledged: value }
    }))
}));
