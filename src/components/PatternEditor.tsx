import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PatternValue } from '../types';

type Props = {
  pattern: PatternValue[];
  onToggle: (index: number) => void;
};

export default function PatternEditor({ pattern, onToggle }: Props) {
  return (
    <View style={styles.container}>
      {pattern.map((value, index) => (
        <Pressable
          key={index}
          onPress={() => onToggle(index)}
          style={[styles.chip, value === 1 ? styles.standChip : styles.sitChip]}
        >
          <Text style={styles.chipText}>#{index + 1}: {value === 1 ? 'Stand (1)' : 'Sit (0)'}</Text>
        </Pressable>
      ))}
      <Text style={styles.legend}>1 = stand after rakat, 0 = sit after rakat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  standChip: { backgroundColor: '#e8f7ee', borderColor: '#2a9d55' },
  sitChip: { backgroundColor: '#fff2e8', borderColor: '#d97706' },
  chipText: { color: '#1f2937', fontWeight: '600' },
  legend: { marginTop: 4, color: '#6b7280', fontSize: 12 }
});
