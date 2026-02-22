import React, { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import { PrayerType, type RootStackParamList } from '../types';
import { getDefaultConfig } from '../utils/patternGenerator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const PRAYER_ORDER: PrayerType[] = [
  PrayerType.SABAH,
  PrayerType.OGLE,
  PrayerType.IKINDI,
  PrayerType.AKSAM,
  PrayerType.YATSI,
  PrayerType.TERAVIH
];

export default function HomeScreen({ navigation }: Props) {
  const selectedPrayer = usePrayerStore((state) => state.selectedPrayer);
  const selectPrayer = usePrayerStore((state) => state.selectPrayer);

  const prayers = PRAYER_ORDER.map((prayer) => getDefaultConfig(prayer));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Debug')} hitSlop={8}>
          <Text style={styles.headerDebugText}>[Debug]</Text>
        </Pressable>
      )
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>NamazGostergem</Text>
      <Text style={styles.subtitle}>Select a prayer (domain model wired)</Text>

      <View style={styles.list}>
        {prayers.map((prayer) => {
          const isSelected = prayer.id === selectedPrayer;
          return (
            <Pressable
              key={prayer.id}
              onPress={() => selectPrayer(prayer.id)}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <Text style={styles.cardTitle}>{prayer.name}</Text>
              <Text style={styles.cardMeta}>Varsayılan Rakat: {prayer.defaultRakats}</Text>
              <Text style={styles.cardMeta}>Preset: {prayer.patternPreset}</Text>
              <Text style={styles.cardMeta}>Pattern: [{prayer.defaultPattern.join(', ')}]</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.secondaryButtonText}>Settings</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Session')}>
          <Text style={styles.primaryButtonText}>Open Session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  headerDebugText: { color: '#0ea5e9', fontWeight: '700', fontSize: 13 },
  list: { gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardSelected: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardMeta: { marginTop: 4, color: '#475569', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  secondaryButtonText: { color: '#0f172a', fontWeight: '700' },
  primaryButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700' }
});

