import type { ReplaySample } from './replayTypes';

export type ReplayMeta = {
  id: string;
  name: string;
  file: unknown;
};

export const REPLAY_SAMPLES: ReplayMeta[] = [
  {
    id: 'sample1',
    name: 'Örnek Namaz 1',
    file: require('../../assets/replay/sample_salah_1.json')
  }
];

/**
 * Returns built-in replay samples. Async for future file-picker support.
 */
export async function loadReplaySamples(): Promise<ReplayMeta[]> {
  return REPLAY_SAMPLES;
}

/**
 * Loads replay data from a meta entry.
 * In Metro/Expo, require() for .json usually resolves to the parsed object.
 */
export async function loadReplayData(meta: ReplayMeta): Promise<ReplaySample[]> {
  const data = meta.file as ReplaySample[];
  if (Array.isArray(data)) return data;
  return [];
}
