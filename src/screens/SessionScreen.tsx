import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import { SessionStatus } from '../types';
import { useRakatStateMachine } from '../hooks/useRakatStateMachine';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export default function SessionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const prayerConfig = usePrayerStore((state) => state.prayerConfig);
  const rakats = usePrayerStore((state) => state.rakats);
  const debug = usePrayerStore((state) => state.debug);
  const sessionStatus = usePrayerStore((state) => state.sessionStatus);
  const currentRakatIndex = usePrayerStore((state) => state.currentRakatIndex);
  const endSession = usePrayerStore((state) => state.endSession);

  const { currentFsmState, debugLogs, lastVibrationReason, lastSample, lastPitch } = useRakatStateMachine(
    sessionStatus === SessionStatus.RUNNING
  );

  const prayerName = prayerConfig?.name ?? 'Namaz';

  const onFinish = () => {
    endSession();
    navigation.navigate('Home');
  };

  const lastLogs = debugLogs.slice(-5);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      {debug && (
        <View style={styles.debugOverlay} pointerEvents="none">
          <Text style={styles.debugTitle}>FSM: {currentFsmState}</Text>
          <Text style={styles.debugText}>
            Pitch: {lastPitch != null ? `${lastPitch.toFixed(1)}°` : '—'}  |a|:{' '}
            {lastSample ? lastSample.magnitude.toFixed(2) : '—'}
          </Text>
          {lastSample && (
            <Text style={styles.debugText}>
              X: {lastSample.x.toFixed(2)}  Y: {lastSample.y.toFixed(2)}  Z: {lastSample.z.toFixed(2)}
            </Text>
          )}
          {lastVibrationReason != null && (
            <View style={styles.vibrationIndicator}>
              <Text style={styles.vibrationText}>📳 {lastVibrationReason}</Text>
            </View>
          )}
          <View style={styles.debugDivider} />
          {lastLogs.map((line, i) => (
            <Text key={i} style={styles.debugLogLine} numberOfLines={1}>
              [log] {line}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.centerBlock}>
        <Text style={styles.title}>Oturum Başladı</Text>
        <Text style={styles.info}>{prayerName}</Text>
        <Text style={styles.info}>
          Rekat: {currentRakatIndex + 1} / {rakats}
        </Text>
        <Text style={styles.infoDim}>Durum: {sessionStatus}</Text>
      </View>

      <Pressable style={[styles.finishButton, { bottom: insets.bottom + 24 }]} onPress={onFinish}>
        <Text style={styles.finishButtonText}>Bitir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  debugOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 320,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10
  },
  debugTitle: {
    color: '#0ff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  debugText: {
    color: '#fff',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginBottom: 2
  },
  debugDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 6
  },
  debugLogLine: {
    color: '#aaa',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    marginBottom: 2
  },
  vibrationIndicator: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 100, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  vibrationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  centerBlock: {
    alignItems: 'center'
  },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  info: { color: '#cbd5e1', fontSize: 16, marginBottom: 4 },
  infoDim: { color: '#64748b', fontSize: 14, marginBottom: 4 },
  finishButton: {
    position: 'absolute',
    bottom: 48,
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  finishButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 }
});
