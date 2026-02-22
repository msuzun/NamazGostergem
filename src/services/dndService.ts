import * as ExpoLinking from 'expo-linking';
import { Platform } from 'react-native';

export const dndService = {
  getNoticeMessage() {
    if (Platform.OS === 'android') {
      return 'Android DND control is limited in Expo managed apps. Use system settings to enable Do Not Disturb manually.';
    }

    return 'iOS apps cannot toggle Focus / Do Not Disturb programmatically. Please enable it manually in Settings or Control Center.';
  },
  async openSystemSettings() {
    await ExpoLinking.openSettings();
  }
};
