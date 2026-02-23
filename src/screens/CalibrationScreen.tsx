import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccelerometerSample } from '../services/sensorService';
import { startAccelerometer, stopAccelerometer } from '../services/sensorService';
import { extractFeatures } from '../algorithms/features';
import { mean, stdDev } from '../utils/mathUtils';
import { usePrayerStore } from '../store/usePrayerStore';
import type { RootStackParamList } from '../types';
import type { ThresholdSettings } from '../services/settingsService';

type Props = NativeStackScreenProps<RootStackParamList, 'Calibration'>;

type CalibrationStep = 'INTRO' | 'STANDING' | 'RUKU' | 'SAJDAH' | 'RESULTS';

const STANDING_DURATION_MS = 3000;
const RUKU_DURATION_MS = 4000;
const SAJDAH_DURATION_MS = 4000;

export default function CalibrationScreen({ navigation }: Props) {
  const [step, setStep] = useState<CalibrationStep>('INTRO');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [standingAvgPitch, setStandingAvgPitch] = useState<number | null>(null);
  const [standingStdPitch, setStandingStdPitch] = useState<number | null>(null);
  const [rukuMinPitch, setRukuMinPitch] = useState<number | null>(null);
  const [rukuAvgPitch, setRukuAvgPitch] = useState<number | null>(null);
  const [sajdahMinPitch, setSajdahMinPitch] = useState<number | null>(null);
  const [sajdahAvgPitch, setSajdahAvgPitch] = useState<number | null>(null);

  const samplesRef = useRef<AccelerometerSample[]>([]);
  const stopAccelRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const standingAvgRef = useRef<number>(70);
  const rukuAvgRef = useRef<number>(40);

  const updateThresholds = usePrayerStore((state) => state.updateThresholds);
  const saveThresholdsToStorage = usePrayerStore((state) => state.saveThresholdsToStorage);

  useEffect(() => {
    return () => {
      stopAccelerometer();
      stopAccelRef.current?.();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCollecting = () => {
    samplesRef.current = [];
    const stop = startAccelerometer((s) => {
      samplesRef.current.push(s);
    }, { intervalMs: 20 });
    stopAccelRef.current = stop;
  };

  const stopCollecting = () => {
    stopAccelRef.current?.();
    stopAccelRef.current = null;
    stopAccelerometer();
  };

  const runStandingStep = () => {
    setStep('STANDING');
    setCountdown(3);
    startCollecting();

    let t = 3;
    intervalRef.current = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        stopCollecting();
        const samples = samplesRef.current;
        const pitches = samples.map((s) => extractFeatures(s).pitch);
        if (pitches.length > 0) {
          const avg = mean(pitches);
          standingAvgRef.current = avg;
          setStandingAvgPitch(avg);
          setStandingStdPitch(stdDev(pitches));
        }
        setCountdown(null);
        setStep('RUKU');
      }
    }, 1000);
  };

  const runRukuStep = () => {
    setCountdown(4);
    startCollecting();

    const standingAvg = standingAvgRef.current;
    let t = 4;
    intervalRef.current = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        stopCollecting();
        const samples = samplesRef.current;
        const pitches = samples.map((s) => extractFeatures(s).pitch);
        if (pitches.length > 0) {
          const minP = Math.min(...pitches);
          setRukuMinPitch(minP);
          const rukuSamples = samples.filter((s) => extractFeatures(s).pitch < standingAvg - 20);
          const rukuPitches = rukuSamples.map((s) => extractFeatures(s).pitch);
          const rukuAvg = rukuPitches.length > 0 ? mean(rukuPitches) : minP;
          rukuAvgRef.current = rukuAvg;
          setRukuAvgPitch(rukuAvg);
        }
        setCountdown(null);
        setStep('SAJDAH');
      }
    }, 1000);
  };

  const runSajdahStep = () => {
    setCountdown(4);
    startCollecting();

    const rukuAvg = rukuAvgRef.current;
    let t = 4;
    intervalRef.current = setInterval(() => {
      t -= 1;
      setCountdown(t);
      if (t <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        stopCollecting();
        const samples = samplesRef.current;
        const pitches = samples.map((s) => extractFeatures(s).pitch);
        if (pitches.length > 0) {
          const minP = Math.min(...pitches);
          setSajdahMinPitch(minP);
          const sajdahSamples = samples.filter((s) => extractFeatures(s).pitch < rukuAvg - 10);
          const sajdahPitches = sajdahSamples.map((s) => extractFeatures(s).pitch);
          setSajdahAvgPitch(sajdahPitches.length > 0 ? mean(sajdahPitches) : minP);
        }
        setCountdown(null);
        setStep('RESULTS');
      }
    }, 1000);
  };

  useEffect(() => {
    if (step === 'RUKU') runRukuStep();
  }, [step]);

  useEffect(() => {
    if (step === 'SAJDAH') runSajdahStep();
  }, [step]);

  const standing = standingAvgPitch ?? 0;
  const ruku = rukuAvgPitch ?? 0;
  const sajdah = sajdahAvgPitch ?? 0;
  const suggested: Partial<ThresholdSettings> = {
    standingMinPitch: Math.round(standing - 15),
    rukuMaxPitch: Math.round((standing + ruku) / 2),
    sajdahMaxPitch: Math.round(sajdah + 10),
    sittingPitchMin: Math.round(sajdah + 15),
    sittingPitchMax: Math.round(ruku - 5)
  };

  const applySuggested = async () => {
    updateThresholds(suggested);
    await saveThresholdsToStorage();
    navigation.goBack();
  };

  if (step === 'INTRO') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Kalibrasyon Sihirbazı</Text>
        <Text style={styles.paragraph}>
          Bu sihirbaz, cihazınızın namaz pozisyonlarını daha iyi tanıması için eşik değerlerini
          kişiselleştirir.
        </Text>
        <Text style={styles.paragraph}>3 adım sürer: Ayakta, Rükû ve Secde.</Text>
        <Pressable style={styles.primaryButton} onPress={runStandingStep}>
          <Text style={styles.primaryButtonText}>Başla</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'STANDING') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Adım 1: Ayakta Durun</Text>
        <Text style={styles.instruction}>
          Namaz kılarken tuttuğunuz gibi 3 saniye hareketsiz durun.
        </Text>
        {countdown != null && countdown > 0 && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
      </View>
    );
  }

  if (step === 'RUKU') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Adım 2: Rükû Yapın</Text>
        <Text style={styles.instruction}>
          Rükûya gidin, 2 saniye bekleyin, sonra doğrulun.
        </Text>
        {countdown != null && countdown > 0 && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
      </View>
    );
  }

  if (step === 'SAJDAH') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Adım 3: Secdeye Gidin</Text>
        <Text style={styles.instruction}>
          Secdeye gidin, 2 saniye bekleyin, sonra doğrulun.
        </Text>
        {countdown != null && countdown > 0 && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalibrasyon Sonuçları</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Pozisyon</Text>
          <Text style={styles.tableLabel}>Ölçülen Ort. Açı</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Ayakta</Text>
          <Text style={styles.tableCell}>{standingAvgPitch?.toFixed(1) ?? '—'}°</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Rükû</Text>
          <Text style={styles.tableCell}>{rukuAvgPitch?.toFixed(1) ?? '—'}°</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Secde</Text>
          <Text style={styles.tableCell}>{sajdahAvgPitch?.toFixed(1) ?? '—'}°</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Önerilen eşikler</Text>
      <View style={styles.suggestedBox}>
        <Text style={styles.suggestedRow}>
          Ayakta min: {suggested.standingMinPitch}° | Rükû max: {suggested.rukuMaxPitch}°
        </Text>
        <Text style={styles.suggestedRow}>
          Secde max: {suggested.sajdahMaxPitch}° | Oturuş: {suggested.sittingPitchMin}°–{suggested.sittingPitchMax}°
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={applySuggested}>
        <Text style={styles.primaryButtonText}>Önerilen Değerleri Uygula</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryButtonText}>İptal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  paragraph: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12
  },
  instruction: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24
  },
  countdown: {
    color: '#4CAF50',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  secondaryButtonText: { color: '#aaa', fontSize: 14 },
  table: { marginBottom: 20 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  tableLabel: { color: '#888', fontWeight: '600' },
  tableCell: { color: '#fff' },
  sectionLabel: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  suggestedBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24
  },
  suggestedRow: { color: '#ccc', fontSize: 13, marginBottom: 4 }
});
