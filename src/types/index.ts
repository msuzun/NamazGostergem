export type PrayerName =
  | 'Sabah'
  | 'Öğle'
  | 'İkindi'
  | 'Akşam'
  | 'Yatsı'
  | 'Teravih';

export type PatternValue = 0 | 1;

export type PrayerConfig = {
  id: string;
  name: PrayerName;
  rakatCount: number;
  pattern: PatternValue[];
};

export type SessionStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export type RootStackParamList = {
  Home: undefined;
  PrayerConfig: { prayerId: string };
  Session: undefined;
  Info: undefined;
};

export type PoseLabel =
  | 'unknown'
  | 'standing'
  | 'ruku'
  | 'sujud'
  | 'sitting'
  | 'transitionUp';

export type MotionEvent = {
  type: 'RAKAT_RISE_FROM_SUJUD2';
  timestamp: number;
};
