export type PrayerName = 'Sabah' | 'Öğle' | 'İkindi' | 'Akşam' | 'Yatsı' | 'Teravih';
export type PatternValue = 0 | 1;

export type PrayerConfig = {
  id: string;
  name: PrayerName;
  rakatCount: number;
  pattern: PatternValue[];
};

export type SessionState = 'idle' | 'running' | 'finished';

export type RootStackParamList = {
  Home: undefined;
  Session: undefined;
  Settings: undefined;
};
