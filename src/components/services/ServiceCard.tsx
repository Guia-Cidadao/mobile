import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, shadows, spacing } from '@/theme';
import type { Servico } from '@/types/servico';

interface ServiceCardProps {
  servico: Servico;
  onPress: () => void;
}

/** Card de serviço público exibido no catálogo principal. */
export function ServiceCard({ servico, onPress }: ServiceCardProps) {
  const docCount = servico.documentos?.length ?? 0;
  const docLabel =
    docCount === 0
      ? 'Sem documentos listados'
      : docCount === 1
        ? '1 documento necessário'
        : `${docCount} documentos necessários`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${servico.nome}. ${docLabel}`}
      accessibilityHint="Toque para abrir os detalhes e documentos exigidos"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={24} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <AppText variant="subtitle" numberOfLines={1}>
          {servico.nome}
        </AppText>

        <AppText variant="body" color="textSecondary" numberOfLines={2}>
          {servico.descricao}
        </AppText>

        <View style={styles.footer}>
          <View style={styles.badge}>
            <Ionicons name="folder-open-outline" size={14} color={colors.secondary} />
            <AppText variant="caption" color="secondary">
              {docLabel}
            </AppText>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardPressed: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.pill,
  },
});
