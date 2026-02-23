/**
 * Deterministic finite state machine for one rakat cycle:
 * STANDING → RUKU → SAJDAH_1 → SITTING → SAJDAH_2 → RISING → STANDING (then RAKAT_COMPLETED).
 */

import type { AccelerometerSample } from '../services/sensorService';
import { extractFeatures, type PostureFeatures } from './features';
import { RAKAT_CONFIG } from './rakatConfig';
import type { ThresholdSettings } from '../services/settingsService';

export enum RakatState {
  STANDING = 'STANDING',
  RUKU = 'RUKU',
  SAJDAH_1 = 'SAJDAH_1',
  SITTING = 'SITTING',
  SAJDAH_2 = 'SAJDAH_2',
  RISING = 'RISING'
}

export type RakatEvent =
  | { type: 'RAKAT_COMPLETED' }
  | { type: 'STATE_CHANGED'; from: RakatState; to: RakatState }
  | { type: 'DEBUG_LOG'; message: string };

type FsmConfig = {
  standingMinPitch: number;
  rukuMaxPitch: number;
  sajdahMaxPitch: number;
  sittingPitchMin: number;
  sittingPitchMax: number;
  requiredStableSamples: number;
  risingStabilizeSamples: number;
};

function buildConfig(thresholds?: Partial<ThresholdSettings>): FsmConfig {
  const [sitMin, sitMax] = RAKAT_CONFIG.SITTING_PITCH_RANGE;
  const debounceMs = thresholds?.debounceMs ?? RAKAT_CONFIG.DEBOUNCE_MS;
  const risingStabilizeMs = thresholds?.risingStabilizeMs ?? RAKAT_CONFIG.RISING_STABILIZE_MS;
  const sampleRateHz = RAKAT_CONFIG.SAMPLE_RATE_HZ;

  return {
    standingMinPitch: thresholds?.standingMinPitch ?? RAKAT_CONFIG.STANDING_MIN_PITCH,
    rukuMaxPitch: thresholds?.rukuMaxPitch ?? RAKAT_CONFIG.RUKU_MAX_PITCH,
    sajdahMaxPitch: thresholds?.sajdahMaxPitch ?? RAKAT_CONFIG.SAJDAH_MAX_PITCH,
    sittingPitchMin: thresholds?.sittingPitchMin ?? sitMin,
    sittingPitchMax: thresholds?.sittingPitchMax ?? sitMax,
    requiredStableSamples: Math.max(1, Math.round((debounceMs / 1000) * sampleRateHz)),
    risingStabilizeSamples: Math.max(1, Math.round((risingStabilizeMs / 1000) * sampleRateHz))
  };
}

export type RakatStateMachineOptions = {
  onEvent: (event: RakatEvent) => void;
  debug?: boolean;
  thresholds?: Partial<ThresholdSettings>;
};

function getCandidateState(
  current: RakatState,
  pitch: number,
  config: FsmConfig
): RakatState | null {
  switch (current) {
    case RakatState.STANDING:
      return pitch <= config.rukuMaxPitch ? RakatState.RUKU : null;
    case RakatState.RUKU:
      return pitch <= config.sajdahMaxPitch ? RakatState.SAJDAH_1 : null;
    case RakatState.SAJDAH_1:
      return pitch >= config.sittingPitchMin && pitch <= config.sittingPitchMax
        ? RakatState.SITTING
        : null;
    case RakatState.SITTING:
      return pitch <= config.sajdahMaxPitch ? RakatState.SAJDAH_2 : null;
    case RakatState.SAJDAH_2:
      return pitch >= config.rukuMaxPitch ? RakatState.RISING : null;
    case RakatState.RISING:
      return pitch >= config.standingMinPitch ? RakatState.STANDING : null;
    default:
      return null;
  }
}

export function createRakatStateMachine(options: RakatStateMachineOptions): {
  feed(sample: AccelerometerSample): void;
  reset(): void;
  getCurrentState(): RakatState;
} {
  const { onEvent, debug = false, thresholds } = options;
  const config = buildConfig(thresholds);

  let currentState: RakatState = RakatState.STANDING;
  let candidateState: RakatState | null = null;
  let stableCount = 0;
  let risingStableCount = 0;

  function emit(event: RakatEvent): void {
    if (event.type === 'DEBUG_LOG' && debug) {
      onEvent(event);
    } else if (event.type !== 'DEBUG_LOG') {
      onEvent(event);
    }
  }

  function transitionTo(next: RakatState): void {
    const from = currentState;
    currentState = next;
    candidateState = null;
    stableCount = 0;
    if (next === RakatState.RISING) {
      risingStableCount = 0;
    }
    emit({ type: 'STATE_CHANGED', from, to: next });
    if (debug) {
      emit({ type: 'DEBUG_LOG', message: `${from}→${next}` });
    }
  }

  function feed(sample: AccelerometerSample): void {
    const features: PostureFeatures = extractFeatures(sample);
    const { pitch, magnitude } = features;
    const candidate = getCandidateState(currentState, pitch, config);

    if (debug && (candidate !== candidateState || stableCount === 0)) {
      emit({
        type: 'DEBUG_LOG',
        message: `pitch=${pitch.toFixed(1)}° |a|=${magnitude.toFixed(3)} candidate=${candidate ?? '-'} stable=${stableCount}`
      });
    }

    if (currentState === RakatState.RISING) {
      risingStableCount += 1;
    }

    if (candidate === null) {
      candidateState = null;
      stableCount = 0;
      return;
    }

    if (candidate !== candidateState) {
      candidateState = candidate;
      stableCount = 1;
      return;
    }

    stableCount += 1;

    if (currentState === RakatState.RISING && candidate === RakatState.STANDING) {
      if (
        risingStableCount >= config.risingStabilizeSamples &&
        stableCount >= config.requiredStableSamples
      ) {
        transitionTo(RakatState.STANDING);
        emit({ type: 'RAKAT_COMPLETED' });
        if (debug) {
          emit({ type: 'DEBUG_LOG', message: 'RAKAT_COMPLETED' });
        }
      }
      return;
    }

    if (stableCount >= config.requiredStableSamples) {
      transitionTo(candidate);
    }
  }

  function reset(): void {
    currentState = RakatState.STANDING;
    candidateState = null;
    stableCount = 0;
    risingStableCount = 0;
  }

  function getCurrentState(): RakatState {
    return currentState;
  }

  return { feed, reset, getCurrentState };
}
