/**
 * Deterministic finite state machine for one rakat cycle:
 * STANDING → RUKU → SAJDAH_1 → SITTING → SAJDAH_2 → RISING → STANDING (then RAKAT_COMPLETED).
 */

import type { AccelerometerSample } from '../services/sensorService';
import { extractFeatures, type PostureFeatures } from './features';
import {
  RAKAT_CONFIG,
  RISING_STABILIZE_SAMPLES
} from './rakatConfig';

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

export type RakatStateMachineOptions = {
  onEvent: (event: RakatEvent) => void;
  debug?: boolean;
};

const REQUIRED_STABLE_SAMPLES = RAKAT_CONFIG.SAMPLES_PER_DEBOUNCE;
const [SIT_MIN, SIT_MAX] = RAKAT_CONFIG.SITTING_PITCH_RANGE;

function getCandidateState(current: RakatState, pitch: number): RakatState | null {
  switch (current) {
    case RakatState.STANDING:
      return pitch <= RAKAT_CONFIG.RUKU_MAX_PITCH ? RakatState.RUKU : null;
    case RakatState.RUKU:
      return pitch <= RAKAT_CONFIG.SAJDAH_MAX_PITCH ? RakatState.SAJDAH_1 : null;
    case RakatState.SAJDAH_1:
      return pitch >= SIT_MIN && pitch <= SIT_MAX ? RakatState.SITTING : null;
    case RakatState.SITTING:
      return pitch <= RAKAT_CONFIG.SAJDAH_MAX_PITCH ? RakatState.SAJDAH_2 : null;
    case RakatState.SAJDAH_2:
      return pitch >= RAKAT_CONFIG.RUKU_MAX_PITCH ? RakatState.RISING : null;
    case RakatState.RISING:
      return pitch >= RAKAT_CONFIG.STANDING_MIN_PITCH ? RakatState.STANDING : null;
    default:
      return null;
  }
}

export function createRakatStateMachine(options: RakatStateMachineOptions): {
  feed(sample: AccelerometerSample): void;
  reset(): void;
  getCurrentState(): RakatState;
} {
  const { onEvent, debug = false } = options;

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
    const candidate = getCandidateState(currentState, pitch);

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
      if (risingStableCount >= RISING_STABILIZE_SAMPLES && stableCount >= REQUIRED_STABLE_SAMPLES) {
        transitionTo(RakatState.STANDING);
        emit({ type: 'RAKAT_COMPLETED' });
        if (debug) {
          emit({ type: 'DEBUG_LOG', message: 'RAKAT_COMPLETED' });
        }
      }
      return;
    }

    if (stableCount >= REQUIRED_STABLE_SAMPLES) {
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
