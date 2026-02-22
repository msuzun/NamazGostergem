import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { DndHelper } from '../services/dnd';

export default function InfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sound / DND Guidance</Text>

      <View style={styles.card}>
        <Text style={styles.body}>{DndHelper.getPlatformMessage()}</Text>
        <Text style={styles.note}>
          Platform: {Platform.OS === 'android' ? 'Android' : 'iOS'}
        </Text>

        <Pressable style={styles.btn} onPress={() => DndHelper.openSystemSettings()}>
          <Text style={styles.btnText}>Open System Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  body: { color: '#334155', lineHeight: 20 },
  note: { color: '#64748b', fontSize: 12 },
  btn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  btnText: { color: 'white', fontWeight: '700' }
});
