import { create } from 'zustand';
import type { PrayerConfig, SessionState } from '../types';

type PrayerStore = {
  prayers: PrayerConfig[];
  sessionState: SessionState;
  selectedPrayerId: string | null;
  setSelectedPrayerId: (id: string | null) => void;
  setSessionState: (state: SessionState) => void;
};

const initialPrayers: PrayerConfig[] = [
  { id: 'sabah', name: 'Sabah', rakatCount: 2, pattern: [1, 0] },
  { id: 'ogle', name: 'Öğle', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'ikindi', name: 'İkindi', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'aksam', name: 'Akşam', rakatCount: 3, pattern: [1, 0, 0] },
  { id: 'yatsi', name: 'Yatsı', rakatCount: 4, pattern: [1, 0, 1, 0] },
  { id: 'teravih', name: 'Teravih', rakatCount: 8, pattern: [1, 0, 1, 0, 1, 0, 1, 0] }
];

export const usePrayerStore = create<PrayerStore>((set) => ({
  prayers: initialPrayers,
  sessionState: 'idle',
  selectedPrayerId: null,
  setSelectedPrayerId: (id) => set({ selectedPrayerId: id }),
  setSessionState: (state) => set({ sessionState: state })
}));
