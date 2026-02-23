import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePrayerStore } from '../store/usePrayerStore';
import { PrayerType } from '../types';
import { getDefaultConfig } from '../utils/patternGenerator';
import { useAccelerometer } from '../hooks/useAccelerometer';

const PRAYER_ORDER: PrayerType[] = [
  PrayerType.SABAH,
  PrayerType.OGLE,
  PrayerType.IKINDI,
  PrayerType.AKSAM,
  PrayerType.YATSI,
  PrayerType.TERAVIH
];

export default function DebugScreen() {
  const store = usePrayerStore();
  const sample = useAccelerometer(true, true);

  const patternToDisplay =
    store.pattern.length > 0
      ? store.pattern
      : store.selectedPrayer
        ? getDefaultConfig(store.selectedPrayer).defaultPattern
        : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Debug Screen</Text>

      <Text style={styles.sectionTitle}>Accelerometer (live)</Text>
      <View style={styles.sensorBox}>
        {sample ? (
          <>
            <Text style={styles.sensorText}>X:  {sample.x.toFixed(4)}</Text>
            <Text style={styles.sensorText}>Y: {sample.y.toFixed(4)}</Text>
            <Text style={styles.sensorText}>Z:  {sample.z.toFixed(4)}</Text>
            <Text style={styles.sensorText}>|a|: {sample.magnitude.toFixed(4)}</Text>
          </>
        ) : (
          <Text style={styles.sensorText}>No data</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Prayer Selection</Text>
      <View style={styles.buttonWrap}>
        {PRAYER_ORDER.map((prayer) => {
          const config = getDefaultConfig(prayer);
          return (
            <Pressable key={prayer} style={styles.smallButton} onPress={() => store.selectPrayer(prayer)}>
              <Text style={styles.smallButtonText}>{config.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Session Actions</Text>
      <View style={styles.buttonWrap}>
        <Pressable style={styles.actionButton} onPress={store.startSession}>
          <Text style={styles.actionButtonText}>startSession()</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={store.advanceRakat}>
          <Text style={styles.actionButtonText}>advanceRakat()</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={store.endSession}>
          <Text style={styles.actionButtonText}>endSession()</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={store.resetSession}>
          <Text style={styles.actionButtonText}>resetSession()</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => store.setDebug(!store.debug)}>
          <Text style={styles.actionButtonText}>debug: {store.debug ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Pattern Chips</Text>
      <View style={styles.chipsWrap}>
        {patternToDisplay.map((value, index) => (
          <View key={`${index}-${value}`} style={[styles.chip, value === 1 ? styles.chipStand : styles.chipSit]}>
            <Text style={styles.chipText}>#{index + 1}</Text>
            <Text style={styles.chipText}>{value === 1 ? 'Kalk' : 'Otur'}</Text>
          </View>
        ))}
        {patternToDisplay.length === 0 && <Text style={styles.emptyText}>No pattern yet. Select a prayer.</Text>}
      </View>

      <Text style={styles.sectionTitle}>Store Snapshot</Text>
      <View style={styles.jsonBox}>
        <Text style={styles.jsonText}>
          {JSON.stringify(
            {
              selectedPrayer: store.selectedPrayer,
              prayerConfig: store.prayerConfig,
              rakats: store.rakats,
              pattern: store.pattern,
              sessionStatus: store.sessionStatus,
              currentRakatIndex: store.currentRakatIndex,
              completedRakats: store.completedRakats,
              debug: store.debug
            },
            null,
            2
          )}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 4 },
  sensorBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12
  },
  sensorText: {
    color: '#0ff',
    fontFamily: 'monospace',
    fontSize: 13
  },
  buttonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  smallButtonText: { color: '#0f172a', fontWeight: '600', fontSize: 12 },
  actionButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1
  },
  chipStand: { backgroundColor: '#dcfce7', borderColor: '#16a34a' },
  chipSit: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  chipText: { color: '#111827', fontWeight: '700', fontSize: 12 },
  emptyText: { color: '#64748b' },
  jsonBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12
  },
  jsonText: {
    color: '#e2e8f0',
    fontFamily: 'monospace'
  }
});
