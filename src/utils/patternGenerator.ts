import { PatternPreset, PrayerType, type PrayerConfig } from '../types';

const cyclePattern = (rakats: number, basePattern: number[]): number[] => {
  if (rakats <= 0 || basePattern.length === 0) return [];

  return Array.from({ length: rakats }, (_, index) => basePattern[index % basePattern.length]);
};

export function generatePattern(rakats: number, preset: PatternPreset): number[] {
  switch (preset) {
    case PatternPreset.STANDARD_2:
      return cyclePattern(rakats, [1, 0]);
    case PatternPreset.STANDARD_3:
      return cyclePattern(rakats, [1, 1, 0]);
    case PatternPreset.STANDARD_4:
      return cyclePattern(rakats, [1, 0, 1, 0]);
    case PatternPreset.TERAVIH_20:
      return cyclePattern(rakats, [1, 0]);
    default:
      return cyclePattern(rakats, [1, 0]);
  }
}

export function getDefaultConfig(prayer: PrayerType): PrayerConfig {
  switch (prayer) {
    case PrayerType.SABAH:
      return {
        id: PrayerType.SABAH,
        name: 'Sabah',
        defaultRakats: 2,
        defaultPattern: generatePattern(2, PatternPreset.STANDARD_2),
        patternPreset: PatternPreset.STANDARD_2
      };
    case PrayerType.OGLE:
      return {
        id: PrayerType.OGLE,
        name: 'Öğle',
        defaultRakats: 4,
        defaultPattern: generatePattern(4, PatternPreset.STANDARD_4),
        patternPreset: PatternPreset.STANDARD_4
      };
    case PrayerType.IKINDI:
      return {
        id: PrayerType.IKINDI,
        name: 'İkindi',
        defaultRakats: 4,
        defaultPattern: generatePattern(4, PatternPreset.STANDARD_4),
        patternPreset: PatternPreset.STANDARD_4
      };
    case PrayerType.AKSAM:
      return {
        id: PrayerType.AKSAM,
        name: 'Akşam',
        defaultRakats: 3,
        defaultPattern: generatePattern(3, PatternPreset.STANDARD_3),
        patternPreset: PatternPreset.STANDARD_3
      };
    case PrayerType.YATSI:
      return {
        id: PrayerType.YATSI,
        name: 'Yatsı',
        defaultRakats: 4,
        defaultPattern: generatePattern(4, PatternPreset.STANDARD_4),
        patternPreset: PatternPreset.STANDARD_4
      };
    case PrayerType.TERAVIH:
      return {
        id: PrayerType.TERAVIH,
        name: 'Teravih',
        defaultRakats: 20,
        defaultPattern: generatePattern(20, PatternPreset.TERAVIH_20),
        patternPreset: PatternPreset.TERAVIH_20
      };
    default:
      return {
        id: PrayerType.SABAH,
        name: 'Sabah',
        defaultRakats: 2,
        defaultPattern: generatePattern(2, PatternPreset.STANDARD_2),
        patternPreset: PatternPreset.STANDARD_2
      };
  }
}

// SANITY: SABAH(2) -> [1,0] ✓
// SANITY: OGLE(4) -> [1,0,1,0] ✓
// SANITY: AKSAM(3) -> [1,1,0] ✓
// SANITY: TERAVIH(20) -> [1,0,1,0,...] x 10 ✓

