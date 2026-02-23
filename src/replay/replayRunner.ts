import type { ReplaySample, ReplayResult } from './replayTypes';
import { createRakatStateMachine, RakatState } from '../algorithms/rakatStateMachine';
import type { AccelerometerSample } from '../services/sensorService';
import { getDefaultThresholds } from '../services/settingsService';

/**
 * Runs recorded samples through the rakat FSM and returns total rakat count
 * and state timeline. Uses default thresholds (or pass store thresholds for tuning).
 */
export async function runReplay(
  samples: ReplaySample[],
  options?: { debug?: boolean; thresholds?: ReturnType<typeof getDefaultThresholds> }
): Promise<ReplayResult> {
  const thresholds = options?.thresholds ?? getDefaultThresholds();
  let rakatCount = 0;
  const stateTimeline: { timestamp: number; state: string }[] = [];

  let currentTimestamp = 0;

  const machine = createRakatStateMachine({
    thresholds,
    debug: options?.debug ?? false,
    onEvent: (event) => {
      if (event.type === 'RAKAT_COMPLETED') {
        rakatCount += 1;
      }
      if (event.type === 'STATE_CHANGED') {
        stateTimeline.push({
          timestamp: currentTimestamp,
          state: event.to
        });
      }
    }
  });

  for (const s of samples) {
    currentTimestamp = s.timestamp;

    const accelSample: AccelerometerSample = {
      x: s.x,
      y: s.y,
      z: s.z,
      magnitude: Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z),
      raw: { x: s.x, y: s.y, z: s.z }
    };

    machine.feed(accelSample);
  }

  return {
    totalRakats: rakatCount,
    stateTimeline
  };
}
