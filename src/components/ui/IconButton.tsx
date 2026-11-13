import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { colors, MIN_TOUCH_SIZE } from '@/theme';

import type { IconName } from './icon';

interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
  size?: number;
}

/** Botão somente-ícone com área de toque mínima e rótulo de acessibilidade obrigatório. */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color = colors.textOnPrimary,
  size = 24,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MIN_TOUCH_SIZE / 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
