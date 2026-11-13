import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { IconName } from '@/components/ui/icon';
import { colors, spacing } from '@/theme';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
}

/** Estado ilustrado para listas vazias ou falhas de carregamento. */
export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  action,
  tone = 'neutral',
}: EmptyStateProps) {
  const isDanger = tone === 'danger';

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={[styles.iconCircle, isDanger && styles.iconCircleDanger]}>
        <Ionicons name={icon} size={40} color={isDanger ? colors.danger : colors.primary} />
      </View>
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      {description && (
        <AppText variant="body" color="textSecondary" align="center">
          {description}
        </AppText>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  iconCircleDanger: {
    backgroundColor: colors.dangerLight,
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
