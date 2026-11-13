import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, MIN_TOUCH_SIZE, radius, spacing } from '@/theme';

import { AppText } from './AppText';

import type { IconName } from './icon';

export type TextFieldRef = ComponentRef<typeof TextInput>;

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  isPassword?: boolean;
  showCounter?: boolean;
}

/** Campo de texto com rótulo, ícone, mensagem de erro e alternância de visibilidade de senha. */
export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextField(
  {
    label,
    error,
    hint,
    icon,
    isPassword = false,
    showCounter = false,
    value,
    maxLength,
    multiline,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  const borderColor = error ? colors.danger : isFocused ? colors.primary : colors.border;

  return (
    <View style={styles.container}>
      <AppText variant="label" color="textPrimary" style={styles.label}>
        {label}
      </AppText>

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          { borderColor },
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.textMuted}
            style={multiline ? styles.iconMultiline : undefined}
          />
        )}

        <TextInput
          ref={ref}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !isSecureVisible}
          selectionColor={colors.primary}
          maxFontSizeMultiplier={1.6}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />

        {isPassword && (
          <Pressable
            onPress={() => setIsSecureVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={isSecureVisible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={8}
            style={styles.toggle}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <View style={styles.errorRow} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <AppText variant="caption" color="danger" style={styles.flex}>
              {error}
            </AppText>
          </View>
        ) : hint ? (
          <AppText variant="caption" color="textSecondary" style={styles.flex}>
            {hint}
          </AppText>
        ) : (
          <View style={styles.flex} />
        )}

        {showCounter && maxLength !== undefined && (
          <AppText variant="caption" color="textMuted">
            {`${value?.length ?? 0}/${maxLength}`}
          </AppText>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    marginLeft: spacing.xxs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_SIZE + 4,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  inputWrapperFocused: {
    backgroundColor: '#FBFCFF',
  },
  iconMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  toggle: {
    padding: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: 18,
  },
  errorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
});
