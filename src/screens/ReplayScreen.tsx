import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadReplaySamples, loadReplayData, type ReplayMeta } from '../replay/replayLoader';
import { runReplay } from '../replay/replayRunner';
import type { ReplayResult } from '../replay/replayTypes';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Replay'>;

export default function ReplayScreen({ navigation }: Props) {
  const [samples, setSamples] = useState<ReplayMeta[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<ReplayMeta | null>(null);
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadReplaySamples().then(setSamples);
  }, []);

  const handleRun = async () => {
    if (!selectedReplay) return;
    setIsRunning(true);
    setResult(null);
    try {
      const data = await loadReplayData(selectedReplay);
      const runResult = await runReplay(data, { debug: true });
      setResult(runResult);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tekrar / Simülasyon</Text>

      <Text style={styles.sectionLabel}>Kayıt listesi</Text>
      {samples.map((meta) => (
        <Pressable
          key={meta.id}
          style={[styles.sampleRow, selectedReplay?.id === meta.id && styles.sampleRowSelected]}
          onPress={() => setSelectedReplay(meta)}
          accessibilityLabel={`${meta.name} kaydını seç`}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedReplay?.id === meta.id }}
        >
          <Text style={styles.sampleName}>{meta.name}</Text>
        </Pressable>
      ))}

      <Pressable
        style={[styles.runButton, (!selectedReplay || isRunning) && styles.runButtonDisabled]}
        onPress={handleRun}
        disabled={!selectedReplay || isRunning}
        accessibilityLabel="Replay çalıştır"
        accessibilityRole="button"
        accessibilityHint="Seçili kayıtla state machine testi yapar"
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.runButtonText}>Çalıştır</Text>
        )}
      </Pressable>

      {result != null && (
        <>
          <Text style={styles.resultLabel}>Sonuç özeti</Text>
          <Text style={styles.resultSummary}>Toplam rakat: {result.totalRakats}</Text>

          <Text style={styles.timelineLabel}>Zaman çizelgesi</Text>
          <FlatList
            style={styles.timelineList}
            data={result.stateTimeline}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.timelineRow}>
                <Text style={styles.timelineTime}>
                  {String(item.timestamp).padStart(5, ' ')} ms
                </Text>
                <Text style={styles.timelineState}>{item.state}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 16
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16
  },
  sectionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8
  },
  sampleRow: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  sampleRowSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  sampleName: {
    color: '#fff',
    fontSize: 14
  },
  runButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  runButtonDisabled: {
    opacity: 0.5
  },
  runButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  },
  resultLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4
  },
  resultSummary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  timelineLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8
  },
  timelineList: {
    maxHeight: 280
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  timelineTime: {
    color: '#aaa',
    fontVariant: ['tabular-nums'],
    fontSize: 12
  },
  timelineState: {
    color: '#fff',
    fontSize: 12
  }
});
