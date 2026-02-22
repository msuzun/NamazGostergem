import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const prayers = usePrayerStore((s) => s.prayers);
  const selectedPrayerId = usePrayerStore((s) => s.session.selectedPrayerId);
  const selectPrayer = usePrayerStore((s) => s.selectPrayer);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prayer Selection</Text>

      <FlatList
        data={prayers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const selected = item.id === selectedPrayerId;
          return (
            <Pressable
              onPress={() => selectPrayer(item.id)}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  Rakats: {item.rakatCount} | Pattern: [{item.pattern.join(', ')}]
                </Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate('PrayerConfig', { prayerId: item.id })}
                style={styles.smallBtn}
              >
                <Text style={styles.smallBtnText}>Config</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('Info')}>
          <Text style={styles.secondaryBtnText}>DND / Info</Text>
        </Pressable>

        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Session')}>
          <Text style={styles.primaryBtnText}>Start Session</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  cardSelected: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardSub: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  smallBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  smallBtnText: { color: 'white', fontWeight: '700' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center'
  },
  secondaryBtnText: { color: '#0f172a', fontWeight: '700' }
});
