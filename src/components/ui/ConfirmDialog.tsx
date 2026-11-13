import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

import type { IconName } from './icon';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  icon?: IconName;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmação acessível para ações destrutivas ou importantes. */
export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = tone === 'danger';
  const resolvedIcon: IconName = icon ?? (isDanger ? 'warning-outline' : 'help-circle-outline');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={isLoading ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel="Fechar confirmação"
      >
        <Pressable
          style={styles.dialog}
          onPress={(event) => event.stopPropagation()}
          accessibilityRole="alert"
        >
          <View style={[styles.iconBadge, isDanger && styles.iconBadgeDanger]}>
            <Ionicons
              name={resolvedIcon}
              size={28}
              color={isDanger ? colors.danger : colors.primary}
            />
          </View>

          <AppText variant="subtitle" align="center">
            {title}
          </AppText>

          <AppText variant="body" color="textSecondary" align="center">
            {description}
          </AppText>

          <View style={styles.actions}>
            <AppButton
              title={cancelLabel}
              variant="ghost"
              onPress={onCancel}
              disabled={isLoading}
              style={styles.actionButton}
            />
            <AppButton
              title={confirmLabel}
              variant={isDanger ? 'danger' : 'primary'}
              onPress={onConfirm}
              isLoading={isLoading}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.floating,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  iconBadgeDanger: {
    backgroundColor: colors.dangerLight,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
