import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { InlineAlert } from '@/components/feedback/InlineAlert';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField, type TextFieldRef } from '@/components/ui/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { colors, radius, spacing } from '@/theme';
import { hasNoErrors, validateEmail, validateRequired } from '@/utils/validators';

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const passwordInputRef = useRef<TextFieldRef>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const errors: LoginFieldErrors = {
      email: validateEmail(email),
      password: validateRequired(password, 'A senha'),
    };
    setFieldErrors(errors);
    return hasNoErrors(errors);
  }

  async function handleLogin() {
    setSubmitError(null);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      showToast('Bem-vindo ao Guia Cidadão!', 'success');
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, {
          401: 'E-mail ou senha incorretos.',
          403: 'E-mail ou senha incorretos.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer edges={['top', 'bottom']} contentStyle={styles.screenContent}>
      <StatusBar style="dark" />

      <View style={styles.brandSection}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logotipo do Guia Cidadão"
          />
        </View>
        <AppText variant="display" color="primary" align="center">
          Guia Cidadão
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          Serviços públicos, documentos e orientação cidadã em um só lugar.
        </AppText>
      </View>

      <Card style={styles.formCard}>
        <AppText variant="title">Entrar na sua conta</AppText>

        {submitError && <InlineAlert message={submitError} tone="error" />}

        <TextField
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
          onSubmitEditing={() => passwordInputRef.current?.focus()}
        />

        <TextField
          ref={passwordInputRef}
          label="Senha"
          placeholder="Digite sua senha"
          icon="lock-closed-outline"
          isPassword
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="done"
          value={password}
          error={fieldErrors.password}
          onChangeText={(value) => {
            setPassword(value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          onSubmitEditing={handleLogin}
        />

        <AppButton
          title="Entrar"
          icon="log-in-outline"
          isLoading={isSubmitting}
          onPress={handleLogin}
          style={styles.submitButton}
        />
      </Card>

      <View style={styles.footerSection}>
        <AppText variant="body" color="textSecondary" align="center">
          Ainda não possui cadastro?
        </AppText>
        <AppButton
          title="Criar conta gratuita"
          variant="outline"
          icon="person-add-outline"
          disabled={isSubmitting}
          onPress={() => router.push('/(auth)/register')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logo: {
    width: 64,
    height: 64,
  },
  formCard: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footerSection: {
    gap: spacing.sm,
  },
});
