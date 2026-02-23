import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  onExit: () => void | Promise<void>;
  style?: object;
  textStyle?: object;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/**
 * Exit session: single press or long-press both call onExit (teardown + navigation).
 * onExit is async-safe — awaited before navigation.
 */
export default function ExitButton({
  onExit,
  style,
  textStyle,
  accessibilityLabel = 'Oturumu bitir',
  accessibilityHint = 'Namaz oturumunu sonlandırır ve ana sayfaya döner'
}: Props) {
  const handleExit = () => {
    Promise.resolve(onExit()).catch(() => {});
  };

  return (
    <Pressable
      style={[styles.button, style]}
      onPress={handleExit}
      onLongPress={handleExit}
      delayLongPress={600}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.buttonText, textStyle]}>Bitir</Text>
    </Pressable>
  );
}

const MIN_TOUCH_SIZE = 44;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: MIN_TOUCH_SIZE,
    minWidth: MIN_TOUCH_SIZE,
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
