import type { MotionEvent, PoseLabel } from '../../types';
import { LowPassFilter3D, magnitude, type Vec3 } from './lowPass';

type Phase =
  | 'WAIT_STANDING'
  | 'IN_STANDING'
  | 'IN_RUKU'
  | 'IN_SUJUD_1'
  | 'IN_SITTING_BETWEEN'
  | 'IN_SUJUD_2';

type Sample = Vec3 & { timestamp: number };

type PoseMeta = {
  pose: PoseLabel;
  mag: number;
  tiltZ: number;
  deltaMag: number;
};

export class RakatMotionDetector {
  private filter = new LowPassFilter3D(0.18);
  private phase: Phase = 'WAIT_STANDING';
  private prevMag = 0;
  private lastPoseChangeAt = 0;
  private stablePose: PoseLabel = 'unknown';
  private stablePoseCount = 0;
  private lastEventAt = 0;

  reset() {
    this.filter.reset();
    this.phase = 'WAIT_STANDING';
    this.prevMag = 0;
    this.lastPoseChangeAt = 0;
    this.stablePose = 'unknown';
    this.stablePoseCount = 0;
    this.lastEventAt = 0;
  }

  update(sample: Sample): MotionEvent[] {
    const filtered = this.filter.update(sample);
    const mag = magnitude(filtered);
    const deltaMag = Math.abs(mag - this.prevMag);
    this.prevMag = mag;

    const poseMeta = this.classifyPose(filtered, mag, deltaMag);

    const pose = this.applyStability(poseMeta.pose, sample.timestamp);
    if (!pose) return [];

    return this.advanceFsm(pose, poseMeta, sample.timestamp);
  }

  private classifyPose(v: Vec3, mag: number, deltaMag: number): PoseMeta {
    // Heuristic model (phone orientation varies in real life).
    // We keep this intentionally simple and documented so it can be tuned later.
    const tiltZ = v.z / (mag || 1); // normalized z contribution (-1..1)
    const tiltY = v.y / (mag || 1);

    let pose: PoseLabel = 'unknown';

    // Motion burst while exiting sujud often creates a noticeable spike.
    if (deltaMag > 0.22) {
      pose = 'transitionUp';
    } else if (tiltZ > 0.65 || tiltY > 0.65) {
      pose = 'standing';
    } else if (tiltZ > 0.25) {
      pose = 'ruku';
    } else if (tiltZ < -0.15) {
      pose = 'sujud';
    } else if (tiltZ >= -0.15 && tiltZ <= 0.2) {
      pose = 'sitting';
    }

    return { pose, mag, tiltZ, deltaMag };
  }

  private applyStability(pose: PoseLabel, timestamp: number): PoseLabel | null {
    if (pose === this.stablePose) {
      this.stablePoseCount += 1;
    } else {
      this.stablePose = pose;
      this.stablePoseCount = 1;
      this.lastPoseChangeAt = timestamp;
    }

    // Require a few consistent samples (~50Hz) before accepting posture transitions.
    if (this.stablePoseCount < 3 && pose !== 'transitionUp') return null;
    return pose;
  }

  private advanceFsm(pose: PoseLabel, meta: PoseMeta, timestamp: number): MotionEvent[] {
    const events: MotionEvent[] = [];

    switch (this.phase) {
      case 'WAIT_STANDING':
        if (pose === 'standing') this.phase = 'IN_STANDING';
        break;

      case 'IN_STANDING':
        if (pose === 'ruku') this.phase = 'IN_RUKU';
        break;

      case 'IN_RUKU':
        if (pose === 'sujud') this.phase = 'IN_SUJUD_1';
        break;

      case 'IN_SUJUD_1':
        if (pose === 'sitting') this.phase = 'IN_SITTING_BETWEEN';
        break;

      case 'IN_SITTING_BETWEEN':
        if (pose === 'sujud') this.phase = 'IN_SUJUD_2';
        break;

      case 'IN_SUJUD_2':
        // Key event: detect start rising from 2nd sajdah.
        // We accept either a transition burst or a shift into standing/ruku/sitting.
        if (
          pose === 'transitionUp' ||
          (pose !== 'sujud' && (meta.deltaMag > 0.12 || pose === 'standing' || pose === 'sitting'))
        ) {
          if (timestamp - this.lastEventAt > 500) {
            events.push({ type: 'RAKAT_RISE_FROM_SUJUD2', timestamp });
            this.lastEventAt = timestamp;
          }
          this.phase = 'IN_STANDING';
        }
        break;
    }

    return events;
  }
}
