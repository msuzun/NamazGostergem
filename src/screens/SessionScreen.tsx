import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import type { RootStackParamList } from '../types';
import { useSessionController } from '../hooks/useSessionController';
import { usePrayerStore } from '../store/usePrayerStore';
import { DndHelper } from '../services/dnd';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export default function SessionScreen({ navigation }: Props) {
  const { countdown, session, selectedPrayer, beginSessionFlow, endSession, abortAndReset } = useSessionController();
  const setDndNoticeAcknowledged = usePrayerStore((s) => s.setDndNoticeAcknowledged);
  const dndNoticeAcknowledged = usePrayerStore((s) => s.session.dndNoticeAcknowledged);

  const [showDndModal, setShowDndModal] = useState(false);

  useKeepAwake();

  const currentRakatHuman = session.currentRakatIndex + 1;
  const isRunning = session.status === 'running';
  const isCountdown = session.status === 'countdown';

  useFocusEffect(
    React.useCallback(() => {
      const sub = navigation.addListener('beforeRemove', (e) => {
        if (isRunning || isCountdown) {
          e.preventDefault();
        }
      });
      return sub;
    }, [navigation, isRunning, isCountdown])
  );

  useEffect(() => {
    if (session.status === 'idle') {
      if (!dndNoticeAcknowledged) {
        setShowDndModal(true);
      } else {
        void beginSessionFlow();
      }
    }
  }, [session.status, dndNoticeAcknowledged, beginSessionFlow]);

  useEffect(() => {
    if (session.status === 'finished') {
      const timer = setTimeout(async () => {
        await abortAndReset();
        navigation.replace('Home');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [session.status, abortAndReset, navigation]);

  const progressText = useMemo(() => {
    if (!selectedPrayer) return '';
    return `Prayer: ${selectedPrayer.name} | Rakat ${Math.min(currentRakatHuman, selectedPrayer.rakatCount)} / ${selectedPrayer.rakatCount}`;
  }, [selectedPrayer, currentRakatHuman]);

  const confirmDndAndStart = async () => {
    setDndNoticeAcknowledged(true);
    setShowDndModal(false);
    await beginSessionFlow();
  };

  return (
    <View style={styles.root}>
      <Modal visible={showDndModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{Platform.OS === 'android' ? 'Android DND Notice' : 'iOS Focus Notice'}</Text>
            <Text style={styles.modalText}>{DndHelper.getPlatformMessage()}</Text>

            <Pressable style={styles.modalBtnSecondary} onPress={() => DndHelper.openSystemSettings()}>
              <Text style={styles.modalBtnSecondaryText}>Open Settings</Text>
            </Pressable>

            <Pressable style={styles.modalBtnPrimary} onPress={confirmDndAndStart}>
              <Text style={styles.modalBtnPrimaryText}>Continue to Session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {(isCountdown || session.status === 'idle') && !showDndModal && (
        <View style={styles.centered}>
          <Text style={styles.countdownTitle}>{selectedPrayer?.name}</Text>
          <Text style={styles.countdownSub}>{progressText}</Text>
          <Text style={styles.countdownNumber}>{countdown ?? ''}</Text>
        </View>
      )}

      {isRunning && (
        <View style={styles.blackOverlay} pointerEvents="auto">
          {/* Hidden long-press stop zone (top-left corner) */}
          <Pressable
            style={styles.hiddenExitZone}
            onLongPress={async () => {
              await endSession();
              await abortAndReset();
              navigation.replace('Home');
            }}
            delayLongPress={3000}
          />

          {__DEV__ && (
            <Pressable
              style={styles.debugStopBtn}
              onPress={async () => {
                await endSession();
                await abortAndReset();
                navigation.replace('Home');
              }}
            >
              <Text style={styles.debugStopText}>Stop (Debug)</Text>
            </Pressable>
          )}
        </View>
      )}

      {session.status === 'finished' && (
        <View style={styles.centered}>
          <Text style={styles.doneText}>Session Completed</Text>
          <Text style={styles.doneSub}>If you changed DND / mute manually, restore your preferred sound mode now.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  countdownTitle: { color: 'white', fontSize: 28, fontWeight: '700' },
  countdownSub: { color: '#cbd5e1', textAlign: 'center' },
  countdownNumber: { color: 'white', fontSize: 72, fontWeight: '800', marginTop: 8 },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000'
  },
  hiddenExitZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 90,
    height: 90,
    opacity: 0.01
  },
  debugStopBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10
  },
  debugStopText: { color: 'white', fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    gap: 12
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalText: { color: '#374151', lineHeight: 20 },
  modalBtnSecondary: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalBtnSecondaryText: { color: '#111827', fontWeight: '700' },
  modalBtnPrimary: {
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalBtnPrimaryText: { color: 'white', fontWeight: '700' },
  doneText: { color: 'white', fontSize: 28, fontWeight: '800' },
  doneSub: { color: '#cbd5e1', textAlign: 'center' }
});
