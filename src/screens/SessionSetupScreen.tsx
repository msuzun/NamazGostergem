import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSetup'>;

const MIN_RAKATS = 1;
const MAX_RAKATS = 20;

export default function SessionSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const selectedPrayer = usePrayerStore((state) => state.selectedPrayer);
  const prayerConfig = usePrayerStore((state) => state.prayerConfig);
  const rakats = usePrayerStore((state) => state.rakats);
  const pattern = usePrayerStore((state) => state.pattern);
  const debug = usePrayerStore((state) => state.debug);

  const setRakats = usePrayerStore((state) => state.setRakats);
  const setDebug = usePrayerStore((state) => state.setDebug);
  const startSession = usePrayerStore((state) => state.startSession);

  const prayerName = prayerConfig?.name ?? selectedPrayer ?? 'Namaz';

  const onMinus = () => setRakats(Math.max(MIN_RAKATS, rakats - 1));
  const onPlus = () => setRakats(Math.min(MAX_RAKATS, rakats + 1));

  const onStart = () => {
    startSession();
    navigation.navigate('Session');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.headerSection}>
        <Text style={styles.prayerTitle}>{prayerName}</Text>
        <Text style={styles.sectionSubtitle}>Rekat Ayarları</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Rekat Sayısı</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={onMinus}
            disabled={rakats <= MIN_RAKATS}
            style={[styles.stepperButton, rakats <= MIN_RAKATS && styles.stepperButtonDisabled]}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </Pressable>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{rakats}</Text>
          </View>
          <Pressable
            onPress={onPlus}
            disabled={rakats >= MAX_RAKATS}
            style={[styles.stepperButton, rakats >= MAX_RAKATS && styles.stepperButtonDisabled]}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.note}>Desen otomatik güncellenir</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Rekat Deseni</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.patternScroll}
        >
          {pattern.map((value, index) => (
            <View
              key={index}
              style={[
                styles.chip,
                value === 1 ? styles.chipKalk : styles.chipOtur
              ]}
            >
              <Text style={styles.chipTop}>R{index + 1}</Text>
              <Text style={styles.chipBottom}>{value === 1 ? 'Kalk' : 'Otur'}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.debugRow}>
          <Text style={styles.label}>Debug Modu</Text>
          <Switch
            value={debug}
            onValueChange={setDebug}
            trackColor={{ false: '#2a2a2a', true: '#4CAF50' }}
            thumbColor="#ffffff"
          />
        </View>
        {debug && (
          <Text style={styles.note}>Canlı sensör verileri gösterilecek</Text>
        )}
      </View>

      <Pressable style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>Başla</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 16 },
  headerSection: { marginBottom: 24 },
  prayerTitle: { fontSize: 26, fontWeight: '700', color: '#ffffff' },
  sectionSubtitle: { fontSize: 14, color: '#a0a0a0', marginTop: 4 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 10 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperButtonDisabled: { opacity: 0.5 },
  stepperButtonText: { fontSize: 22, color: '#ffffff', fontWeight: '600' },
  stepperValue: {
    minWidth: 48,
    alignItems: 'center'
  },
  stepperValueText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  note: { fontSize: 12, color: '#888', marginTop: 8 },
  patternScroll: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 56,
    alignItems: 'center'
  },
  chipKalk: { backgroundColor: '#2e7d32' },
  chipOtur: { backgroundColor: '#c62828' },
  chipTop: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  chipBottom: { fontSize: 11, color: '#ffffff', marginTop: 2 },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8
  },
  startButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' }
});
