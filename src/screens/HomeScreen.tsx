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

  const onPrayerPress = (prayer: PrayerType) => {
    selectPrayer(prayer);
    navigation.navigate('SessionSetup');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>NamazGostergem</Text>
      <Text style={styles.subtitle}>Namaz seç</Text>

      <View style={styles.grid}>
        {prayers.map((prayer) => (
          <Pressable
            key={prayer.id}
            onPress={() => onPrayerPress(prayer.id)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{prayer.name}</Text>
            <Text style={styles.cardMeta}>{prayer.defaultRakats} Rekat</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a0a0a0', marginBottom: 20 },
  headerDebugText: { color: '#4CAF50', fontWeight: '700', fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 18,
    minHeight: 88
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  cardMeta: { marginTop: 6, color: '#a0a0a0', fontSize: 13 }
});
