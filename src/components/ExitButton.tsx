import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  onExit: () => void | Promise<void>;
  style?: object;
  textStyle?: object;
};

/**
 * Long-press to exit session. onExit is async-safe — awaited before navigation.
 */
export default function ExitButton({ onExit, style, textStyle }: Props) {
  const handleLongPress = () => {
    Promise.resolve(onExit()).catch(() => {});
  };

  return (
    <Pressable
      style={[styles.button, style]}
      onLongPress={handleLongPress}
      delayLongPress={600}
    >
      <Text style={[styles.buttonText, textStyle]}>Bitir</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  }
});
