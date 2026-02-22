import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Screen</Text>
      <Text style={styles.subtitle}>Black overlay placeholder (no session logic yet)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8, color: '#cbd5e1', textAlign: 'center' }
});
