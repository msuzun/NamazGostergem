/**
 * Rakat detection algorithm — tunable constants.
 *
 * All thresholds are in one place for easy calibration on different devices
 * and user postures. Tune based on real usage:
 *
 * --- Tilt (pitch) thresholds ---
 * Pitch is in degrees: 90° = device upright (standing), 0° = device flat (sajdah).
 * - STANDING_MIN_PITCH: Minimum pitch to consider "standing". Raise if
 *   standing is detected too early when rising from sajdah.
 * - RUKU_MAX_PITCH: Max pitch for bowing (ruku). Lower = stricter ruku.
 * - SAJDAH_MAX_PITCH: Max pitch for prostration. Keep low so only full
 *   sajdah is detected.
 * - SITTING_PITCH_RANGE: [min, max] pitch for sitting between sajdahs.
 *   Adjust if sitting is missed or confused with standing.
 *
 * --- Magnitude ---
 * - MOTION_THRESHOLD: Min change in magnitude to count as "moving". Used
 *   if you add motion-based guards (optional).
 * - STABLE_MAGNITUDE_MIN/MAX: Gravity-only range. If magnitude is outside
 *   this, device may be accelerating; you can require isStable before
 *   transitions (optional).
 *
 * --- Debounce ---
 * - DEBOUNCE_MS: State must be stable this long before a transition is
 *   confirmed. Increase to reduce false transitions from noise.
 * - RISING_STABILIZE_MS: Extra time in RISING before allowing transition
 *   to STANDING and firing RAKAT_COMPLETED. Ensures user has fully risen
 *   before advancing rakat.
 *
 * --- Sampling ---
 * - SAMPLE_RATE_HZ: Must match sensor service (e.g. 50).
 * - SAMPLES_PER_DEBOUNCE: Derived; used for debounce sample count.
 */

export const RAKAT_CONFIG = {
  // --- Tilt thresholds (in degrees, derived from accelerometer) ---
  STANDING_MIN_PITCH: 60, // device roughly upright (held/pocket)
  RUKU_MAX_PITCH: 45, // device tilted forward ~45° = ruku
  SAJDAH_MAX_PITCH: 20, // device nearly horizontal = sajdah
  SITTING_PITCH_RANGE: [30, 60] as [number, number], // sitting: mid-tilt range

  // --- Magnitude thresholds ---
  MOTION_THRESHOLD: 0.15, // min delta magnitude to consider "moving"
  STABLE_MAGNITUDE_MIN: 0.85, // gravity-only range (no extra motion)
  STABLE_MAGNITUDE_MAX: 1.15,

  // --- Debounce ---
  DEBOUNCE_MS: 400, // state must be stable for this long before transition
  RISING_STABILIZE_MS: 600, // extra stabilization after RISING before rakatCompleted fires

  // --- Sampling ---
  SAMPLE_RATE_HZ: 50,
  SAMPLES_PER_DEBOUNCE: 20, // DEBOUNCE_MS / (1000 / SAMPLE_RATE_HZ)
} as const;

export const RISING_STABILIZE_SAMPLES = Math.round(
  (RAKAT_CONFIG.RISING_STABILIZE_MS / 1000) * RAKAT_CONFIG.SAMPLE_RATE_HZ
);
