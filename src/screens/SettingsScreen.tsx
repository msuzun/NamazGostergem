import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import type { RootStackParamList } from '../types';
import type { ThresholdSettings } from '../services/settingsService';
import { openAndroidDndSettings, openIosSettings } from '../native/systemSettings';
import { clamp } from '../utils/mathUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type StepperField = {
  key: keyof ThresholdSettings;
  label: string;
  step: number;
  min?: number;
  max?: number;
};

const ANGLE_FIELDS: StepperField[] = [
  { key: 'standingMinPitch', label: 'Ayakta Min Açı (°)', step: 5 },
  { key: 'rukuMaxPitch', label: 'Rükû Maks Açı (°)', step: 5 },
  { key: 'sajdahMaxPitch', label: 'Secde Maks Açı (°)', step: 2 },
  { key: 'sittingPitchMin', label: 'Oturuş Min Açı (°)', step: 5 },
  { key: 'sittingPitchMax', label: 'Oturuş Maks Açı (°)', step: 5 }
];

const TIMING_FIELDS: StepperField[] = [
  { key: 'debounceMs', label: 'Debounce Süresi (ms)', step: 50 },
  { key: 'risingStabilizeMs', label: 'Kalkış Stabilizasyon (ms)', step: 50 }
];

const FILTER_FIELDS: StepperField[] = [
  { key: 'lowPassAlpha', label: 'Alçak Geçiren Filtre Alpha', step: 0.05, min: 0.05, max: 0.95 }
];

function StepperRow({
  label,
  value,
  step,
  min,
  max,
  onMinus,
  onPlus,
  format = (v: number) => String(Math.round(v))
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onMinus: () => void;
  onPlus: () => void;
  format?: (v: number) => string;
}) {
  const minVal = min ?? 0;
  const maxVal = max ?? 999;
  const canMinus = value > minVal;
  const canPlus = value < maxVal;

  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          style={[styles.stepperBtn, !canMinus && styles.stepperBtnDisabled]}
          onPress={onMinus}
          disabled={!canMinus}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{format(value)}</Text>
        <Pressable
          style={[styles.stepperBtn, !canPlus && styles.stepperBtnDisabled]}
          onPress={onPlus}
          disabled={!canPlus}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const thresholds = usePrayerStore((state) => state.thresholds);
  const updateThresholds = usePrayerStore((state) => state.updateThresholds);
  const saveThresholdsToStorage = usePrayerStore((state) => state.saveThresholdsToStorage);
  const resetThresholdsToDefaults = usePrayerStore((state) => state.resetThresholdsToDefaults);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    await saveThresholdsToStorage();
    setSaveMessage('Kaydedildi');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleReset = async () => {
    await resetThresholdsToDefaults();
  };

  const renderSteppers = (fields: StepperField[]) =>
    fields.map(({ key, label, step, min, max }) => {
      const value = thresholds[key] as number;
      return (
        <StepperRow
          key={key}
          label={label}
          value={value}
          step={step}
          min={min}
          max={max}
          onMinus={() =>
            updateThresholds({ [key]: clamp(value - step, min ?? 0, max ?? 999) as number })
          }
          onPlus={() =>
            updateThresholds({ [key]: clamp(value + step, min ?? 0, max ?? 999) as number })
          }
          format={key === 'lowPassAlpha' ? (v) => v.toFixed(2) : (v) => String(Math.round(v))}
        />
      );
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ayarlar & Eşikler</Text>

      <Text style={styles.sectionTitle}>Açı Eşikleri</Text>
      <View style={styles.section}>{renderSteppers(ANGLE_FIELDS)}</View>

      <Text style={styles.sectionTitle}>Zamanlama (Timing)</Text>
      <View style={styles.section}>{renderSteppers(TIMING_FIELDS)}</View>

      <Text style={styles.sectionTitle}>Filtre (Filter)</Text>
      <View style={styles.section}>
        {renderSteppers(FILTER_FIELDS)}
        <Text style={styles.note}>
          Düşük alpha = daha yumuşak, yüksek alpha = daha hızlı tepki
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Eylemler (Actions)</Text>
      <View style={styles.section}>
        <Pressable
          style={styles.primaryButton}
          onPress={handleSave}
          accessibilityLabel="Eşikleri kaydet"
          accessibilityRole="button"
          accessibilityHint="Eşik değerlerini cihaza kaydeder"
        >
          <Text style={styles.primaryButtonText}>Kaydet</Text>
        </Pressable>
        {saveMessage != null && (
          <Text style={styles.saveMessage}>{saveMessage}</Text>
        )}
        <Pressable
          style={styles.secondaryButton}
          onPress={handleReset}
          accessibilityLabel="Eşikleri varsayılana sıfırla"
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Varsayılana Sıfırla</Text>
        </Pressable>
        <Pressable
          style={styles.calibrationButton}
          onPress={() => navigation.navigate('Calibration')}
          accessibilityLabel="Kalibrasyon sihirbazını aç"
          accessibilityRole="button"
          accessibilityHint="Ayakta, rükû ve secde açılarını ölçerek eşik önerir"
        >
          <Text style={styles.calibrationButtonText}>Kalibrasyon Sihirbazı</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rahatsız Etmeyin (DND)</Text>
        <Text style={styles.cardBody}>
          Namaz sırasında bildirim seslerini azaltmak için işletim sistemi DND ayarlarını kullan.
          Uygulama, Expo managed modda bu ayarları doğrudan değiştiremez.
        </Text>
        {Platform.OS === 'android' ? (
          <Pressable
            style={styles.cardButton}
            onPress={openAndroidDndSettings}
            accessibilityLabel="Android Rahatsız Etmeyin ayarlarını aç"
            accessibilityRole="button"
          >
            <Text style={styles.cardButtonText}>Android DND Ayarlarını Aç</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.cardButton}
            onPress={openIosSettings}
            accessibilityLabel="iOS ayarlarını aç"
            accessibilityRole="button"
          >
            <Text style={styles.cardButtonText}>iOS Ayarlarını Aç</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#aaa', marginBottom: 8 },
  section: { marginBottom: 20 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  stepperLabel: { color: '#ddd', fontSize: 14, flex: 1 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperBtnDisabled: { opacity: 0.4 },
  stepperBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  stepperValue: { color: '#fff', fontSize: 14, minWidth: 44, textAlign: 'center' },
  note: { color: '#888', fontSize: 12, marginTop: 4 },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  saveMessage: { color: '#4CAF50', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  secondaryButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8
  },
  secondaryButtonText: { color: '#ddd', fontSize: 15 },
  calibrationButton: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  calibrationButtonText: { color: '#7eb8ff', fontWeight: '600', fontSize: 15 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  cardBody: { color: '#aaa', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cardButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  cardButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 }
});
