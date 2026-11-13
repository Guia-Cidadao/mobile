import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing, type ColorName } from '@/theme';

import { AppText } from './AppText';

import type { IconName } from './icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  icon?: IconName;
  isLoading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<
  ButtonVariant,
  { background: string; pressed: string; border: string; text: ColorName }
> = {
  primary: {
    background: colors.primary,
    pressed: colors.primaryDark,
    border: colors.primary,
    text: 'textOnPrimary',
  },
  secondary: {
    background: colors.secondary,
    pressed: '#0E8467',
    border: colors.secondary,
    text: 'textOnPrimary',
  },
  outline: {
    background: colors.surface,
    pressed: colors.primaryLight,
    border: colors.primary,
    text: 'primary',
  },
  danger: {
    background: colors.surface,
    pressed: colors.dangerLight,
    border: colors.danger,
    text: 'danger',
  },
  ghost: {
    background: 'transparent',
    pressed: colors.primaryLight,
    border: 'transparent',
    text: 'primary',
  },
};

/** Botão padrão com variantes, ícone, estado de carregamento e acessibilidade. */
export function AppButton({
  title,
  variant = 'primary',
  icon,
  isLoading = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: pressed ? palette.pressed : palette.background,
          borderColor: palette.border,
        },
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={colors[palette.text]} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={20} color={colors[palette.text]} />}
          <AppText variant="button" color={palette.text}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_SIZE + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});
