import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import { PrayerType, type RootStackParamList } from '../types';
import { getDefaultConfig } from '../utils/patternGenerator';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { triggerPatternVibration } from '../services/vibrationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Debug'>;

const PRAYER_ORDER: PrayerType[] = [
  PrayerType.SABAH,
  PrayerType.OGLE,
  PrayerType.IKINDI,
  PrayerType.AKSAM,
  PrayerType.YATSI,
  PrayerType.TERAVIH
];

export default function DebugScreen({ navigation }: Props) {
  const store = usePrayerStore();
  const { sample, error: sensorError } = useAccelerometer(true, true);

  const patternToDisplay =
    store.pattern.length > 0
      ? store.pattern
      : store.selectedPrayer
        ? getDefaultConfig(store.selectedPrayer).defaultPattern
        : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hata Ayıklama</Text>

      <Pressable
        style={styles.debugButton}
        onPress={() => navigation.navigate('Replay')}
        accessibilityLabel="Tekrar / Simülasyon ekranına git"
        accessibilityRole="button"
        accessibilityHint="Kayıtlı sensör verisi ile state machine testi"
      >
        <Text style={styles.debugButtonText}>Tekrar / Simülasyon</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>İvmeölçer (canlı)</Text>
      <View style={styles.sensorBox}>
        {sensorError ? (
          <Text style={styles.sensorErrorText}>{sensorError}</Text>
        ) : sample ? (
          <>
            <Text style={styles.sensorText}>X:  {sample.x.toFixed(4)}</Text>
            <Text style={styles.sensorText}>Y: {sample.y.toFixed(4)}</Text>
            <Text style={styles.sensorText}>Z:  {sample.z.toFixed(4)}</Text>
            <Text style={styles.sensorText}>|a|: {sample.magnitude.toFixed(4)}</Text>
          </>
        ) : (
          <Text style={styles.sensorText}>Veri yok</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Namaz Seçimi</Text>
      <View style={styles.buttonWrap}>
        {PRAYER_ORDER.map((prayer) => {
          const config = getDefaultConfig(prayer);
          return (
            <Pressable
              key={prayer}
              style={styles.smallButton}
              onPress={() => store.selectPrayer(prayer)}
              accessibilityLabel={config.name}
              accessibilityRole="button"
            >
              <Text style={styles.smallButtonText}>{config.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => triggerPatternVibration()}
        style={styles.testButton}
        accessibilityLabel="Test titreşim"
        accessibilityRole="button"
        accessibilityHint="Pattern titreşimini dener"
      >
        <Text style={styles.testButtonText}>📳 Test Titreşim (pattern=0)</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Oturum İşlemleri</Text>
      <View style={styles.buttonWrap}>
        <Pressable
          style={styles.actionButton}
          onPress={store.startSession}
          accessibilityLabel="Oturumu başlat"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>Oturumu Başlat</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={store.advanceRakat}
          accessibilityLabel="Rekat ilerlet"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>Rekat İlerlet</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={store.endSession}
          accessibilityLabel="Oturumu bitir"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>Oturumu Bitir</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={store.resetSession}
          accessibilityLabel="Oturumu sıfırla"
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>Oturumu Sıfırla</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => store.setDebug(!store.debug)}
          accessibilityLabel={store.debug ? 'Debug kapat' : 'Debug aç'}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>debug: {store.debug ? 'Açık' : 'Kapalı'}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Rekat Deseni</Text>
      <View style={styles.chipsWrap}>
        {patternToDisplay.map((value, index) => (
          <View key={`${index}-${value}`} style={[styles.chip, value === 1 ? styles.chipStand : styles.chipSit]}>
            <Text style={styles.chipText}>#{index + 1}</Text>
            <Text style={styles.chipText}>{value === 1 ? 'Kalk' : 'Otur'}</Text>
          </View>
        ))}
        {patternToDisplay.length === 0 && (
          <Text style={styles.emptyText}>Henüz desen yok. Önce bir namaz seçin.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Store Özeti</Text>
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
  debugButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  debugButtonText: { color: '#7eb8ff', fontWeight: '600', fontSize: 14 },
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
  sensorErrorText: {
    color: '#f59e0b',
    fontSize: 13
  },
  testButton: {
    backgroundColor: 'rgba(255, 100, 0, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start'
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '700',
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
