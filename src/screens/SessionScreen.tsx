import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { usePrayerStore } from '../store/usePrayerStore';
import { SessionStatus } from '../types';
import { useRakatStateMachine } from '../hooks/useRakatStateMachine';
import { useSessionTeardown } from '../hooks/useSessionTeardown';
import { useAppStateSession } from '../hooks/useAppStateSession';
import { ensureDndForSessionStart } from '../services/dndService';
import { openAndroidDndSettings, openIosSettings } from '../native/systemSettings';
import ExitButton from '../components/ExitButton';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export default function SessionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [showDndModal, setShowDndModal] = useState(false);
  const [dndExplained, setDndExplained] = useState(false);
  const [backgroundWarning, setBackgroundWarning] = useState(false);

  const prevBrightness = useRef(1.0);

  const prayerConfig = usePrayerStore((state) => state.prayerConfig);
  const rakats = usePrayerStore((state) => state.rakats);
  const debug = usePrayerStore((state) => state.debug);
  const sessionStatus = usePrayerStore((state) => state.sessionStatus);
  const currentRakatIndex = usePrayerStore((state) => state.currentRakatIndex);
  const pauseSession = usePrayerStore((state) => state.pauseSession);
  const resumeSession = usePrayerStore((state) => state.resumeSession);

  const {
    currentFsmState,
    debugLogs,
    lastVibrationReason,
    lastSample,
    lastPitch,
    resetFsm
  } = useRakatStateMachine(sessionStatus === SessionStatus.RUNNING);

  const { teardown } = useSessionTeardown({
    prevBrightness,
    fsmReset: resetFsm
  });

  const handleBackground = useCallback(() => {
    if (sessionStatus === SessionStatus.RUNNING) {
      pauseSession();
      setBackgroundWarning(true);
    }
  }, [sessionStatus, pauseSession]);

  const handleForeground = useCallback(() => {
    // Do NOT auto-resume — require explicit user action.
    // Warning banner stays visible until user taps "Devam Et".
  }, []);

  useAppStateSession({
    onBackground: handleBackground,
    onForeground: handleForeground
  });

  // Prevents Android hardware back button and iOS swipe-back from exiting
  // session without proper teardown. Explicit "Bitir" uses navigation.reset to Home — allow it.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (sessionStatus !== SessionStatus.RUNNING) return;
      const action = (e as any).data?.action;
      const isResetToHome =
        action?.type === 'RESET' &&
        Array.isArray(action?.payload?.routes) &&
        action.payload.routes[0]?.name === 'Home';
      const isNavigateHome =
        action?.type === 'NAVIGATE' && action?.payload?.name === 'Home';
      if (isResetToHome || isNavigateHome) return;
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation, sessionStatus]);

  // teardown() is idempotent — safe to call from both:
  // 1. The cleanup of this useEffect (unmount safety net)
  // 2. The explicit exit button / warning overlay "Oturumu Bitir" button
  // The torn ref inside useSessionTeardown prevents double execution.
  useEffect(() => {
    const status = usePrayerStore.getState().sessionStatus;
    if (status !== SessionStatus.RUNNING) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      return;
    }

    let isMounted = true;

    async function setup() {
      await activateKeepAwakeAsync();

      try {
        const current = await Brightness.getBrightnessAsync();
        prevBrightness.current = current;
        await Brightness.setBrightnessAsync(0.01);
      } catch {
        // iOS may restrict brightness control — black overlay handles dimming
      }

      if (isMounted) {
        const dnd = await ensureDndForSessionStart();
        if (dnd.requiresUserAction && !dndExplained) {
          setShowDndModal(true);
        }
      }
    }

    setup();

    return () => {
      isMounted = false;
      teardown();
    };
  }, []);

  const prayerName = prayerConfig?.name ?? 'Namaz';
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

      <View style={[styles.exitButtonWrap, { bottom: insets.bottom + 24 }]}>
        <ExitButton
          onExit={async () => {
            await teardown();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }}
          style={styles.finishButton}
          textStyle={styles.finishButtonText}
        />
      </View>

      {backgroundWarning && (
        <View style={styles.warningOverlay}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Oturum Duraklatıldı</Text>
          <Text style={styles.warningText}>
            Uygulama arka plana alındığı için oturum otomatik duraklatıldı.
          </Text>
          <Pressable
            style={styles.warningResumeButton}
            onPress={() => {
              setBackgroundWarning(false);
              resumeSession();
            }}
          >
            <Text style={styles.warningResumeText}>▶ Devam Et</Text>
          </Pressable>
          <Pressable
            style={styles.warningEndButton}
            onPress={async () => {
              setBackgroundWarning(false);
              await teardown();
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            }}
          >
            <Text style={styles.warningEndText}>Oturumu Bitir</Text>
          </Pressable>
        </View>
      )}

      {showDndModal && (
        <View style={styles.dndModalOverlay}>
          <View style={styles.dndModal}>
            <Text style={styles.dndTitle}>Rahatsız Etmeyin (DND) Önerisi</Text>
            {Platform.OS === 'android' ? (
              <>
                <Text style={styles.dndText}>
                  Namaz sırasında bildirim ve zil seslerinin rahatsız etmemesi için
                  Android'de Rahatsız Etmeyin modunu açman önerilir.
                </Text>
                <Pressable
                  style={styles.dndButton}
                  onPress={async () => {
                    setDndExplained(true);
                    setShowDndModal(false);
                    await openAndroidDndSettings();
                  }}
                >
                  <Text style={styles.dndButtonText}>Android DND Ayarlarını Aç</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.dndText}>
                  iOS'ta DND (Rahatsız Etmeyin) modu uygulama tarafından
                  otomatik değiştirilemez. Lütfen Ayarlar'dan kendin aç.
                </Text>
                <Pressable
                  style={styles.dndButton}
                  onPress={async () => {
                    setDndExplained(true);
                    setShowDndModal(false);
                    await openIosSettings();
                  }}
                >
                  <Text style={styles.dndButtonText}>iOS Ayarlarını Aç</Text>
                </Pressable>
              </>
            )}
            <Pressable
              style={[styles.dndButton, styles.dndSecondaryButton]}
              onPress={() => {
                setDndExplained(true);
                setShowDndModal(false);
              }}
            >
              <Text style={styles.dndSecondaryButtonText}>Daha Sonra</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  exitButtonWrap: {
    position: 'absolute',
    bottom: 48
  },
  finishButton: {
    backgroundColor: '#2a2a2a'
  },
  finishButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  warningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 100
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  warningTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  warningText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32
  },
  warningResumeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center'
  },
  warningResumeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  warningEndButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  warningEndText: {
    color: '#aaa',
    fontSize: 14
  },
  dndModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 20
  },
  dndModal: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    width: '100%'
  },
  dndTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  dndText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16
  },
  dndButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  dndButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  dndSecondaryButton: {
    backgroundColor: '#333'
  },
  dndSecondaryButtonText: {
    color: '#ddd',
    fontSize: 14
  }
});
