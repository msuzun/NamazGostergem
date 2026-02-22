import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { usePrayerStore } from '../store/usePrayerStore';
import PatternEditor from '../components/PatternEditor';

type Props = NativeStackScreenProps<RootStackParamList, 'PrayerConfig'>;

export default function PrayerConfigScreen({ route }: Props) {
  const { prayerId } = route.params;
  const prayer = usePrayerStore((s) => s.prayers.find((p) => p.id === prayerId));
  const updateRakatCount = usePrayerStore((s) => s.updatePrayerRakatCount);
  const togglePatternValue = usePrayerStore((s) => s.togglePatternValue);

  if (!prayer) {
    return (
      <View style={styles.center}>
        <Text>Prayer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={styles.title}>{prayer.name}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Rakat Count</Text>
        <View style={styles.row}>
          <Pressable style={styles.adjustBtn} onPress={() => updateRakatCount(prayer.id, prayer.rakatCount - 1)}>
            <Text style={styles.adjustText}>-</Text>
          </Pressable>
          <Text style={styles.countText}>{prayer.rakatCount}</Text>
          <Pressable style={styles.adjustBtn} onPress={() => updateRakatCount(prayer.id, prayer.rakatCount + 1)}>
            <Text style={styles.adjustText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pattern Array</Text>
        <PatternEditor pattern={prayer.pattern} onToggle={(index) => togglePatternValue(prayer.id, index)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  label: { fontSize: 16, fontWeight: '700', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjustBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center'
  },
  adjustText: { color: 'white', fontSize: 22, fontWeight: '700' },
  countText: { fontSize: 22, fontWeight: '700', minWidth: 40, textAlign: 'center' }
});
