export type ReplaySample = {
  timestamp: number;
  x: number;
  y: number;
  z: number;
};

export type ReplayResult = {
  totalRakats: number;
  stateTimeline: {
    timestamp: number;
    state: string;
  }[];
};
