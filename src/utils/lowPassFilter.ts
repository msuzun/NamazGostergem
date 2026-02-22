export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export function lowPassFilter(previous: Vec3 | null, current: Vec3, alpha = 0.15): Vec3 {
  if (!previous) return current;

  return {
    x: previous.x + alpha * (current.x - previous.x),
    y: previous.y + alpha * (current.y - previous.y),
    z: previous.z + alpha * (current.z - previous.z)
  };
}
