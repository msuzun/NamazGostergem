export enum PrayerType {
  SABAH = 'SABAH',
  OGLE = 'OGLE',
  IKINDI = 'IKINDI',
  AKSAM = 'AKSAM',
  YATSI = 'YATSI',
  TERAVIH = 'TERAVIH'
}

export enum PatternPreset {
  STANDARD_2 = 'STANDARD_2',
  STANDARD_3 = 'STANDARD_3',
  STANDARD_4 = 'STANDARD_4',
  TERAVIH_20 = 'TERAVIH_20'
}

export interface PrayerConfig {
  id: PrayerType;
  name: string;
  defaultRakats: number;
  defaultPattern: number[];
  patternPreset: PatternPreset;
}

export enum SessionStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}

export interface SessionState {
  status: SessionStatus;
  currentRakatIndex: number;
  completedRakats: number;
  debug: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  SessionSetup: undefined;
  Session: undefined;
  Settings: undefined;
  Debug: undefined;
};

