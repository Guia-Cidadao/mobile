import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { IconName } from '@/components/ui/icon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { userService } from '@/services/userService';
import { colors, MIN_TOUCH_SIZE, radius, spacing } from '@/theme';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) {
    return 'GC';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

interface MenuRowProps {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuRow({ icon, title, subtitle, onPress }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.menuTexts}>
        <AppText variant="bodyMedium">{title}</AppText>
        <AppText variant="caption" color="textSecondary">
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAdmin, signOut, updateSessionUser } = useAuth();
  const { showToast } = useToast();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const userId = user?.id;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function refreshProfile() {
        if (!userId) {
          return;
        }
        try {
          const freshUser = await userService.getById(userId);
          if (isMounted) {
            await updateSessionUser(freshUser);
          }
        } catch {
          // Mantém dados da sessão local caso ocorra oscilação momentânea
        }
      }
      void refreshProfile();
      return () => {
        isMounted = false;
      };
    }, [updateSessionUser, userId]),
  );

  async function handleConfirmLogout() {
    setShowLogoutModal(false);
    await signOut();
    showToast('Você saiu da sua conta com segurança.', 'info');
  }

  async function handleConfirmDeleteAccount() {
    if (!user) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await userService.remove(user.id);
      setShowDeleteModal(false);
      await signOut();
      showToast('Sua conta foi excluída permanentemente.', 'info');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer edges={[]}>
      <Card style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <AppText variant="title" color="textOnPrimary">
            {getInitials(user.nome)}
          </AppText>
        </View>

        <View style={styles.profileInfo}>
          <AppText variant="title" align="center">
            {user.nome}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {user.email}
          </AppText>

          <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={14}
              color={isAdmin ? colors.secondary : colors.primary}
            />
            <AppText variant="caption" color={isAdmin ? 'secondary' : 'primary'}>
              {isAdmin ? 'Administrador Público' : 'Conta Cidadão'}
            </AppText>
          </View>
        </View>
      </Card>

      <Card style={styles.menuCard}>
        <AppText variant="label" color="textSecondary">
          Gerenciamento e Informações
        </AppText>

        <MenuRow
          icon="create-outline"
          title="Editar meus dados"
          subtitle="Atualize seu nome, e-mail e senha de acesso"
          onPress={() => router.push('/(app)/profile/edit')}
        />

        {isAdmin && (
          <MenuRow
            icon="add-circle-outline"
            title="Cadastrar serviço público"
            subtitle="Adicionar novo serviço e lista de documentos no catálogo"
            onPress={() => router.push('/(app)/services/form')}
          />
        )}

        <MenuRow
          icon="information-circle-outline"
          title="Sobre o Guia Cidadão"
          subtitle="Versão do app, arquitetura e hash do commit de referência"
          onPress={() => router.push('/(app)/about')}
        />
      </Card>

      <Card style={styles.sessionCard}>
        <AppText variant="label" color="textSecondary">
          Sessão e Segurança
        </AppText>

        <AppButton
          title="Sair da conta (Logout)"
          icon="log-out-outline"
          variant="outline"
          onPress={() => setShowLogoutModal(true)}
        />

        <AppButton
          title="Excluir minha conta"
          icon="trash-outline"
          variant="danger"
          onPress={() => setShowDeleteModal(true)}
        />
      </Card>

      <ConfirmDialog
        visible={showLogoutModal}
        title="Deseja sair da sua conta?"
        description="Sua sessão será encerrada neste dispositivo e será necessário fazer login novamente para acessar o Guia Cidadão."
        confirmLabel="Sair agora"
        icon="log-out-outline"
        onConfirm={() => void handleConfirmLogout()}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ConfirmDialog
        visible={showDeleteModal}
        tone="danger"
        title="Excluir conta permanentemente?"
        description="Esta ação removerá seu cadastro do servidor e não poderá ser desfeita."
        confirmLabel="Excluir conta"
        isLoading={isDeletingAccount}
        onConfirm={() => void handleConfirmDeleteAccount()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.secondaryLight,
  },
  menuCard: {
    gap: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH_SIZE + 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  menuRowPressed: {
    backgroundColor: colors.primaryLight,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTexts: {
    flex: 1,
    gap: 2,
  },
  sessionCard: {
    gap: spacing.md,
  },
});
