export type Vec3 = { x: number; y: number; z: number };

export class LowPassFilter3D {
  private alpha: number;
  private state: Vec3 | null = null;

  constructor(alpha = 0.15) {
    this.alpha = alpha;
  }

  update(input: Vec3): Vec3 {
    if (!this.state) {
      this.state = input;
      return input;
    }

    this.state = {
      x: this.state.x + this.alpha * (input.x - this.state.x),
      y: this.state.y + this.alpha * (input.y - this.state.y),
      z: this.state.z + this.alpha * (input.z - this.state.z)
    };

    return this.state;
  }

  reset() {
    this.state = null;
  }
}

export const magnitude = (v: Vec3) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
