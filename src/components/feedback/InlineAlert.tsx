import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { IconName } from '@/components/ui/icon';
import { colors, radius, spacing } from '@/theme';

type AlertTone = 'error' | 'info' | 'success' | 'warning';

interface InlineAlertProps {
  message: string;
  tone?: AlertTone;
}

const TONES: Record<AlertTone, { icon: IconName; color: string; background: string }> = {
  error: { icon: 'alert-circle', color: colors.danger, background: colors.dangerLight },
  info: { icon: 'information-circle', color: colors.primary, background: colors.primaryLight },
  success: { icon: 'checkmark-circle', color: colors.secondary, background: colors.secondaryLight },
  warning: { icon: 'warning', color: '#9A7300', background: colors.accentLight },
};

/** Alerta embutido no conteúdo (ex.: erro de envio de formulário). */
export function InlineAlert({ message, tone = 'error' }: InlineAlertProps) {
  const palette = TONES[tone];

  return (
    <View
      style={[styles.container, { backgroundColor: palette.background }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Ionicons name={palette.icon} size={22} color={palette.color} />
      <AppText variant="label" style={[styles.text, { color: palette.color }]}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
  },
});
