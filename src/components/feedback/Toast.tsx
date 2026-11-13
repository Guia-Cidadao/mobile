import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import type { IconName } from '@/components/ui/icon';
import { colors, radius, shadows, spacing } from '@/theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const TOAST_STYLES: Record<ToastType, { icon: IconName; background: string }> = {
  success: { icon: 'checkmark-circle', background: colors.secondary },
  error: { icon: 'close-circle', background: colors.danger },
  info: { icon: 'information-circle', background: colors.primary },
};

/** Notificação flutuante animada exibida no topo da tela. */
export function Toast({ toast, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-120));
  const palette = TOAST_STYLES[toast.type];

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(toast.message);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
  }, [toast, translateY]);

  return (
    <Animated.View
      style={[styles.wrapper, { top: insets.top + spacing.sm, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        accessibilityHint="Toque para fechar"
        style={[styles.toast, { backgroundColor: palette.background }]}
      >
        <Ionicons name={palette.icon} size={24} color={colors.textOnPrimary} />
        <AppText variant="label" color="textOnPrimary" style={styles.message}>
          {toast.message}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.floating,
  },
  message: {
    flex: 1,
  },
});
