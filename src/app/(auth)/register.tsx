import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { InlineAlert } from '@/components/feedback/InlineAlert';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { PasswordRulesList } from '@/components/ui/PasswordRulesList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField, type TextFieldRef } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { colors, spacing } from '@/theme';
import {
  hasNoErrors,
  NAME_MAX_LENGTH,
  validateEmail,
  validateName,
  validatePasswordConfirmation,
  validateStrongPassword,
} from '@/utils/validators';

interface RegisterFieldErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmPasswordRef = useRef<TextFieldRef>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const errors: RegisterFieldErrors = {
      nome: validateName(nome),
      email: validateEmail(email),
      senha: validateStrongPassword(senha),
      confirmarSenha: validatePasswordConfirmation(senha, confirmarSenha),
    };
    setFieldErrors(errors);
    return hasNoErrors(errors);
  }

  async function handleRegister() {
    setSubmitError(null);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({ nome, email, senha });
      showToast('Conta criada com sucesso!', 'success');
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, {
          409: 'Este e-mail ou nome de usuário já está em uso.',
          500: 'Não foi possível concluir o cadastro. Verifique se o e-mail já está cadastrado.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.headerRow}>
        <IconButton
          icon="arrow-back"
          accessibilityLabel="Voltar para o login"
          color={colors.primary}
          onPress={() => router.back()}
        />
        <View style={styles.headerTexts}>
          <AppText variant="title" color="primary">
            Criar nova conta
          </AppText>
          <AppText variant="caption" color="textSecondary">
            Preencha seus dados para acessar o Guia Cidadão
          </AppText>
        </View>
      </View>

      <Card style={styles.formCard}>
        {submitError && <InlineAlert message={submitError} tone="error" />}

        <TextField
          label="Nome completo ou de usuário"
          placeholder="Ex.: Maria Aparecida"
          icon="person-outline"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          maxLength={NAME_MAX_LENGTH}
          value={nome}
          error={fieldErrors.nome}
          onChangeText={(value) => {
            setNome(value);
            if (fieldErrors.nome) {
              setFieldErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <TextField
          ref={emailRef}
          label="E-mail"
          placeholder="seu.email@exemplo.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          value={email}
          error={fieldErrors.email}
          onChangeText={(value) => {
            setEmail(value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <TextField
          ref={passwordRef}
          label="Senha"
          placeholder="Crie uma senha segura"
          icon="lock-closed-outline"
          isPassword
          autoCapitalize="none"
          returnKeyType="next"
          value={senha}
          error={fieldErrors.senha}
          onChangeText={(value) => {
            setSenha(value);
            if (fieldErrors.senha) {
              setFieldErrors((prev) => ({ ...prev, senha: undefined }));
            }
          }}
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />

        <PasswordRulesList password={senha} />

        <TextField
          ref={confirmPasswordRef}
          label="Confirmar senha"
          placeholder="Repita a senha informada"
          icon="shield-checkmark-outline"
          isPassword
          autoCapitalize="none"
          returnKeyType="done"
          value={confirmarSenha}
          error={fieldErrors.confirmarSenha}
          onChangeText={(value) => {
            setConfirmarSenha(value);
            if (fieldErrors.confirmarSenha) {
              setFieldErrors((prev) => ({ ...prev, confirmarSenha: undefined }));
            }
          }}
          onSubmitEditing={handleRegister}
        />

        <AppButton
          title="Cadastrar e entrar"
          icon="checkmark-circle-outline"
          isLoading={isSubmitting}
          onPress={handleRegister}
        />
      </Card>

      <AppButton
        title="Já tenho uma conta"
        variant="ghost"
        disabled={isSubmitting}
        onPress={() => router.back()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTexts: {
    flex: 1,
  },
  formCard: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
