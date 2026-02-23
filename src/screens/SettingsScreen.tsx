import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { openAndroidDndSettings, openIosSettings } from '../native/systemSettings';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rahatsız Etmeyin (DND)</Text>
        <Text style={styles.cardBody}>
          Namaz sırasında bildirim seslerini azaltmak için işletim sistemi DND ayarlarını kullan.
          Uygulama, Expo managed modda bu ayarları doğrudan değiştiremez.
        </Text>
        {Platform.OS === 'android' ? (
          <Pressable style={styles.cardButton} onPress={openAndroidDndSettings}>
            <Text style={styles.cardButtonText}>Android DND Ayarlarını Aç</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.cardButton} onPress={openIosSettings}>
            <Text style={styles.cardButtonText}>iOS Ayarlarını Aç</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  cardBody: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  cardButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  cardButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 }
});
