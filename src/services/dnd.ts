import { Linking, Platform } from 'react-native';

export const DndHelper = {
  isDirectToggleSupportedInExpo(): boolean {
    // Expo managed workflow does not provide a reliable cross-platform DND toggle API.
    return false;
  },

  getPlatformMessage(): string {
    if (Platform.OS === 'android') {
      return 'Expo managed apps cannot reliably toggle Android Do Not Disturb programmatically. For best experience, enable DND or mute manually before starting.';
    }

    return 'iOS does not allow apps to toggle Do Not Disturb / Focus modes programmatically. Please enable a Focus mode or mute manually before starting.';
  },

  async openSystemSettings() {
    try {
      await Linking.openSettings();
    } catch {
      // no-op
    }
  }
};
