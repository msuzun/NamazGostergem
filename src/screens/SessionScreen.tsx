import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePrayerStore } from '../store/usePrayerStore';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export default function SessionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const prayerConfig = usePrayerStore((state) => state.prayerConfig);
  const rakats = usePrayerStore((state) => state.rakats);
  const endSession = usePrayerStore((state) => state.endSession);

  const prayerName = prayerConfig?.name ?? 'Namaz';

  const onFinish = () => {
    endSession();
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Oturum Başladı</Text>
      <Text style={styles.info}>{prayerName}</Text>
      <Text style={styles.info}>{rakats} Rekat</Text>

      <Pressable style={styles.finishButton} onPress={onFinish}>
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
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  info: { color: '#cbd5e1', fontSize: 16, marginBottom: 4 },
  finishButton: {
    marginTop: 32,
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  finishButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 }
});
