import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { getPasswordRules } from '@/utils/validators';

import { AppText } from './AppText';

interface PasswordRulesListProps {
  password: string;
}

/** Checklist visual em tempo real dos requisitos de senha forte exigidos pela API. */
export function PasswordRulesList({ password }: PasswordRulesListProps) {
  const rules = getPasswordRules(password);

  return (
    <View style={styles.container} accessibilityLabel="Requisitos de senha">
      <AppText variant="caption" color="textSecondary">
        A senha deve atender aos seguintes critérios:
      </AppText>
      {rules.map((rule) => (
        <View key={rule.label} style={styles.row}>
          <Ionicons
            name={rule.isMet ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={rule.isMet ? colors.secondary : colors.textMuted}
          />
          <AppText
            variant="caption"
            color={rule.isMet ? 'secondary' : 'textSecondary'}
            style={styles.text}
          >
            {rule.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
