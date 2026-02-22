import * as Brightness from 'expo-brightness';

type BrightnessSnapshot = {
  mode?: number;
  systemBrightness?: number;
  appBrightness?: number;
};

let snapshot: BrightnessSnapshot | null = null;

export async function dimScreenForSession() {
  try {
    await Brightness.requestPermissionsAsync();
  } catch {
    // Some platforms/versions may not require or support explicit permission request.
  }

  snapshot = {};

  try {
    snapshot.systemBrightness = await Brightness.getSystemBrightnessAsync();
  } catch {}

  try {
    snapshot.appBrightness = await Brightness.getBrightnessAsync();
  } catch {}

  try {
    // Prefer system brightness when supported.
    await Brightness.setSystemBrightnessAsync(0.01);
    return;
  } catch {
    // Fallback to app brightness.
  }

  try {
    await Brightness.setBrightnessAsync(0.01);
  } catch {}
}

export async function restoreBrightnessAfterSession() {
  if (!snapshot) return;
  const current = snapshot;

  try {
    if (typeof current.systemBrightness === 'number') {
      await Brightness.setSystemBrightnessAsync(current.systemBrightness);
      snapshot = null;
      return;
    }
  } catch {}

  try {
    if (typeof current.appBrightness === 'number') {
      await Brightness.setBrightnessAsync(current.appBrightness);
    }
  } catch {}

  snapshot = null;
}
