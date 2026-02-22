import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as ExpoLinking from 'expo-linking';

export default function SettingsScreen() {
  const openSystemSettings = async () => {
    try {
      await ExpoLinking.openSettings();
    } catch {
      // Placeholder scaffold: no-op if settings cannot be opened.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DND / Sound Settings</Text>
      <Text style={styles.body}>
        Placeholder screen for DND guidance. Expo managed workflow has platform limitations for direct DND control.
      </Text>
      <Pressable style={styles.button} onPress={openSystemSettings}>
        <Text style={styles.buttonText}>Open System Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  body: { color: '#334155', lineHeight: 20 },
  button: {
    marginTop: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#ffffff', fontWeight: '700' }
});
