import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { servicoService } from '@/services/servicoService';
import { colors, MIN_TOUCH_SIZE, radius, spacing } from '@/theme';
import type { Servico } from '@/types/servico';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const serviceId = Number(id);

  const [servico, setServico] = useState<Servico | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadService = useCallback(async () => {
    if (!Number.isFinite(serviceId)) {
      setErrorMessage('Identificador de serviço inválido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await servicoService.getById(serviceId);
      setServico(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useFocusEffect(
    useCallback(() => {
      void loadService();
    }, [loadService]),
  );

  function toggleDocumentCheck(docName: string) {
    setCheckedDocs((prev) => ({ ...prev, [docName]: !prev[docName] }));
  }

  async function handleConfirmDelete() {
    if (!servico) {
      return;
    }

    setIsDeleting(true);
    try {
      await servicoService.remove(servico.id);
      setShowDeleteModal(false);
      showToast('Serviço público excluído com sucesso.', 'success');
      router.back();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <LoadingState message="Carregando detalhes do serviço..." />;
  }

  if (errorMessage || !servico) {
    return <ErrorState message={errorMessage ?? 'Serviço não encontrado.'} onRetry={loadService} />;
  }

  const documents = servico.documentos ?? [];
  const checkedCount = documents.filter((doc) => checkedDocs[doc]).length;

  return (
    <ScreenContainer>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={28} color={colors.primary} />
          </View>
          <View style={styles.heroTitleBox}>
            <AppText variant="caption" color="secondary">
              {`SERVIÇO PÚBLICO #${servico.id}`}
            </AppText>
            <AppText variant="title">{servico.nome}</AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionBlock}>
          <AppText variant="label" color="textSecondary">
            Descrição e Orientações
          </AppText>
          <AppText variant="body">{servico.descricao}</AppText>
        </View>
      </Card>

      <Card>
        <View style={styles.docsHeader}>
          <View style={styles.docsHeaderTexts}>
            <AppText variant="subtitle">Documentos Necessários</AppText>
            <AppText variant="caption" color="textSecondary">
              Marque os documentos que você já separou para o atendimento
            </AppText>
          </View>
          {documents.length > 0 && (
            <View style={styles.progressBadge}>
              <AppText variant="label" color="secondary">
                {`${checkedCount}/${documents.length}`}
              </AppText>
            </View>
          )}
        </View>

        {documents.length === 0 ? (
          <AppText variant="body" color="textSecondary">
            Nenhum documento obrigatório cadastrado para este serviço.
          </AppText>
        ) : (
          <View style={styles.docsList}>
            {documents.map((doc, index) => {
              const isChecked = Boolean(checkedDocs[doc]);
              return (
                <Pressable
                  key={`${doc}-${index}`}
                  onPress={() => toggleDocumentCheck(doc)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={doc}
                  style={[styles.docItem, isChecked && styles.docItemChecked]}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? colors.secondary : colors.textMuted}
                  />
                  <AppText
                    variant="bodyMedium"
                    color={isChecked ? 'secondary' : 'textPrimary'}
                    style={styles.docText}
                  >
                    {doc}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        )}
      </Card>

      <Card>
        <AppText variant="subtitle">Ficou com alguma dúvida?</AppText>
        <AppText variant="body" color="textSecondary">
          Converse com nosso Assistente Cidadão para receber orientações passo a passo.
        </AppText>
        <AppButton
          title="Perguntar ao Assistente Cidadão"
          icon="chatbubbles-outline"
          variant="outline"
          onPress={() => router.push('/(app)/(tabs)/assistant')}
        />
      </Card>

      {isAdmin && (
        <Card style={styles.adminCard}>
          <View style={styles.adminHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <AppText variant="subtitle" color="primary">
              Ações do Administrador
            </AppText>
          </View>

          <AppButton
            title="Editar serviço público"
            icon="create-outline"
            variant="primary"
            onPress={() =>
              router.push({
                pathname: '/(app)/services/form',
                params: { id: String(servico.id) },
              })
            }
          />

          <AppButton
            title="Excluir serviço público"
            icon="trash-outline"
            variant="danger"
            onPress={() => setShowDeleteModal(true)}
          />
        </Card>
      )}

      <ConfirmDialog
        visible={showDeleteModal}
        tone="danger"
        title="Excluir este serviço público?"
        description={`O serviço "${servico.nome}" será removido permanentemente do catálogo para todos os cidadãos.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleBox: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  docsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  docsHeaderTexts: {
    flex: 1,
    gap: 2,
  },
  progressBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  docsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  docItemChecked: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  docText: {
    flex: 1,
  },
  adminCard: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
