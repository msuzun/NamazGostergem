/**
 * Feature extraction from filtered accelerometer samples.
 * Pure functions: no side effects, same input → same output.
 */

import type { AccelerometerSample } from '../services/sensorService';
import { RAKAT_CONFIG } from './rakatConfig';

export type PostureFeatures = {
  pitch: number; // degrees: 90 = upright, 0 = flat/horizontal
  roll: number; // degrees: side tilt
  magnitude: number; // |a| — should be ~1.0 at rest
  isStable: boolean; // true if magnitude within gravity-only range
};

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Pitch: forward/backward tilt.
 * pitch = atan2(y, sqrt(x² + z²)) * (180 / π)
 * 90° = device upright (standing), 0° = device flat (sajdah).
 *
 * SANITY: standing phone in pocket → pitch ≈ 80–90°
 * SANITY: ruku (bowing) → pitch ≈ 30–45°
 * SANITY: sajdah (prostration) → pitch ≈ 0–20°
 * SANITY: sitting → pitch ≈ 40–60°
 */
function computePitch(x: number, y: number, z: number): number {
  const xz = Math.sqrt(x * x + z * z);
  return Math.atan2(y, xz) * RAD_TO_DEG;
}

/**
 * Roll: side tilt.
 * roll = atan2(x, z) * (180 / π)
 */
function computeRoll(x: number, z: number): number {
  return Math.atan2(x, z) * RAD_TO_DEG;
}

export function extractFeatures(sample: AccelerometerSample): PostureFeatures {
  const { x, y, z, magnitude } = sample;
  const pitch = computePitch(x, y, z);
  const roll = computeRoll(x, z);
  const isStable =
    magnitude >= RAKAT_CONFIG.STABLE_MAGNITUDE_MIN &&
    magnitude <= RAKAT_CONFIG.STABLE_MAGNITUDE_MAX;

  return {
    pitch,
    roll,
    magnitude,
    isStable
  };
}
