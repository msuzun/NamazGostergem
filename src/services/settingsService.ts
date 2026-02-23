/**
 * Thresholds are stored as JSON under a single AsyncStorage key.
 * On app start, loadThresholds() should be called (e.g. from App or store)
 * and applied to the FSM config. For MVP, we apply thresholds at session start only
 * (not hot-reload mid-session).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAKAT_CONFIG } from '../algorithms/rakatConfig';

const SETTINGS_KEY = '@namazgostergem_thresholds';

export type ThresholdSettings = {
  standingMinPitch: number;
  rukuMaxPitch: number;
  sajdahMaxPitch: number;
  sittingPitchMin: number;
  sittingPitchMax: number;
  debounceMs: number;
  risingStabilizeMs: number;
  lowPassAlpha: number;
};

export function getDefaultThresholds(): ThresholdSettings {
  const [sitMin, sitMax] = RAKAT_CONFIG.SITTING_PITCH_RANGE;
  return {
    standingMinPitch: RAKAT_CONFIG.STANDING_MIN_PITCH,
    rukuMaxPitch: RAKAT_CONFIG.RUKU_MAX_PITCH,
    sajdahMaxPitch: RAKAT_CONFIG.SAJDAH_MAX_PITCH,
    sittingPitchMin: sitMin,
    sittingPitchMax: sitMax,
    debounceMs: RAKAT_CONFIG.DEBOUNCE_MS,
    risingStabilizeMs: RAKAT_CONFIG.RISING_STABILIZE_MS,
    lowPassAlpha: 0.2
  };
}

export async function loadThresholds(): Promise<ThresholdSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw == null) return getDefaultThresholds();
    const parsed = JSON.parse(raw) as Partial<ThresholdSettings>;
    const defaults = getDefaultThresholds();
    return { ...defaults, ...parsed };
  } catch {
    return getDefaultThresholds();
  }
}

export async function saveThresholds(settings: ThresholdSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function resetThresholds(): Promise<void> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
}
