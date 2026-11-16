import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { InlineAlert } from '@/components/feedback/InlineAlert';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PasswordRulesList } from '@/components/ui/PasswordRulesList';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField, type TextFieldRef } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { userService } from '@/services/userService';
import { spacing } from '@/theme';
import {
  hasNoErrors,
  NAME_MAX_LENGTH,
  validateEmail,
  validateName,
  validatePasswordConfirmation,
  validateStrongPassword,
} from '@/utils/validators';

interface EditProfileErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateSessionUser } = useAuth();
  const { showToast } = useToast();

  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmPasswordRef = useRef<TextFieldRef>(null);

  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [fieldErrors, setFieldErrors] = useState<EditProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const errors: EditProfileErrors = {
      nome: validateName(nome),
      email: validateEmail(email),
      senha: validateStrongPassword(senha),
      confirmarSenha: validatePasswordConfirmation(senha, confirmarSenha),
    };
    setFieldErrors(errors);
    return hasNoErrors(errors);
  }

  async function handleSave() {
    if (!user) {
      return;
    }

    setSubmitError(null);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await userService.update(user.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      });
      await updateSessionUser(updated);
      showToast('Dados atualizados com sucesso!', 'success');
      router.back();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, {
          409: 'Este e-mail ou nome de usuário já está em uso por outra conta.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer
      footer={
        <AppButton
          title="Salvar alterações"
          icon="save-outline"
          isLoading={isSubmitting}
          onPress={handleSave}
        />
      }
    >
      <Card style={styles.card}>
        <AppText variant="subtitle">Dados Cadastrais</AppText>
        <AppText variant="caption" color="textSecondary">
          Atualize suas informações pessoais e confirme ou defina uma nova senha de acesso.
        </AppText>

        {submitError && <InlineAlert message={submitError} tone="error" />}

        <TextField
          label="Nome de usuário"
          placeholder="Seu nome completo"
          icon="person-outline"
          autoCapitalize="words"
          maxLength={NAME_MAX_LENGTH}
          returnKeyType="next"
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
          label="Nova senha (ou senha atual)"
          placeholder="Digite sua senha para confirmar"
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
          onSubmitEditing={handleSave}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
});
