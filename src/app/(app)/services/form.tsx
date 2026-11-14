import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { InlineAlert } from '@/components/feedback/InlineAlert';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/services/api/apiError';
import { servicoService } from '@/services/servicoService';
import { colors, fonts, MIN_TOUCH_SIZE, radius, spacing } from '@/theme';
import { hasNoErrors, SERVICE_TEXT_MAX_LENGTH, validateRequired } from '@/utils/validators';

interface ServiceFormErrors {
  nome?: string;
  descricao?: string;
  documentos?: string;
}

export default function ServiceFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const editingId = id ? Number(id) : null;
  const isEditing = editingId !== null && Number.isFinite(editingId);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [novoDocumento, setNovoDocumento] = useState('');

  const [fieldErrors, setFieldErrors] = useState<ServiceFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing || editingId === null) {
      return;
    }

    let isMounted = true;
    async function fetchService() {
      try {
        const data = await servicoService.getById(editingId!);
        if (!isMounted) {
          return;
        }
        setNome(data.nome);
        setDescricao(data.descricao);
        setDocumentos(data.documentos ?? []);
      } catch (error) {
        if (isMounted) {
          setSubmitError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    }

    void fetchService();
    return () => {
      isMounted = false;
    };
  }, [editingId, isEditing]);

  function handleAddDocument() {
    const trimmed = novoDocumento.trim();
    if (!trimmed) {
      return;
    }
    if (documentos.some((doc) => doc.toLowerCase() === trimmed.toLowerCase())) {
      setFieldErrors((prev) => ({
        ...prev,
        documentos: 'Este documento já foi adicionado à lista.',
      }));
      return;
    }

    setDocumentos((prev) => [...prev, trimmed]);
    setNovoDocumento('');
    setFieldErrors((prev) => ({ ...prev, documentos: undefined }));
  }

  function handleRemoveDocument(indexToRemove: number) {
    setDocumentos((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function validateForm(): boolean {
    const pendingDoc = novoDocumento.trim();
    const effectiveDocs =
      pendingDoc && !documentos.includes(pendingDoc) ? [...documentos, pendingDoc] : documentos;

    if (pendingDoc && !documentos.includes(pendingDoc)) {
      setDocumentos(effectiveDocs);
      setNovoDocumento('');
    }

    const errors: ServiceFormErrors = {
      nome: validateRequired(nome, 'O nome do serviço'),
      descricao: validateRequired(descricao, 'A descrição do serviço'),
      documentos:
        effectiveDocs.length === 0
          ? 'Adicione pelo menos um documento exigido para este serviço.'
          : undefined,
    };

    setFieldErrors(errors);
    return hasNoErrors(errors);
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validateForm()) {
      return;
    }

    const pendingDoc = novoDocumento.trim();
    const finalDocs =
      pendingDoc && !documentos.includes(pendingDoc) ? [...documentos, pendingDoc] : documentos;

    setIsSubmitting(true);
    try {
      const payload = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        documentos: finalDocs,
      };

      if (isEditing && editingId !== null) {
        await servicoService.update(editingId, payload);
        showToast('Serviço público atualizado com sucesso!', 'success');
      } else {
        await servicoService.create(payload);
        showToast('Novo serviço público cadastrado!', 'success');
      }

      router.back();
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, {
          403: 'Apenas administradores podem criar ou editar serviços públicos.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingInitial) {
    return <LoadingState message="Carregando dados do serviço..." />;
  }

  return (
    <ScreenContainer
      footer={
        <AppButton
          title={isEditing ? 'Salvar alterações' : 'Publicar serviço'}
          icon={isEditing ? 'save-outline' : 'checkmark-circle-outline'}
          isLoading={isSubmitting}
          onPress={handleSubmit}
        />
      }
    >
      <Stack.Screen
        options={{
          title: isEditing ? 'Editar Serviço Público' : 'Novo Serviço Público',
        }}
      />

      <Card style={styles.card}>
        <AppText variant="subtitle">Informações do Serviço</AppText>

        {submitError && <InlineAlert message={submitError} tone="error" />}

        <TextField
          label="Nome do serviço público"
          placeholder="Ex.: Emissão de 1ª Via do RG (CIN)"
          icon="document-text-outline"
          maxLength={SERVICE_TEXT_MAX_LENGTH}
          showCounter
          value={nome}
          error={fieldErrors.nome}
          onChangeText={(value) => {
            setNome(value);
            if (fieldErrors.nome) {
              setFieldErrors((prev) => ({ ...prev, nome: undefined }));
            }
          }}
        />

        <TextField
          label="Descrição e orientações ao cidadão"
          placeholder="Explique como funciona o serviço, quem pode solicitar e prazos..."
          multiline
          maxLength={SERVICE_TEXT_MAX_LENGTH}
          showCounter
          value={descricao}
          error={fieldErrors.descricao}
          onChangeText={(value) => {
            setDescricao(value);
            if (fieldErrors.descricao) {
              setFieldErrors((prev) => ({ ...prev, descricao: undefined }));
            }
          }}
        />
      </Card>

      <Card style={styles.card}>
        <AppText variant="subtitle">Documentos Necessários</AppText>
        <AppText variant="caption" color="textSecondary">
          Adicione cada documento obrigatório que o cidadão deve apresentar.
        </AppText>

        <View style={styles.addDocRow}>
          <TextInput
            value={novoDocumento}
            onChangeText={(value) => {
              setNovoDocumento(value);
              if (fieldErrors.documentos) {
                setFieldErrors((prev) => ({ ...prev, documentos: undefined }));
              }
            }}
            placeholder="Ex.: Certidão de Nascimento original"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Nome do documento obrigatório"
            returnKeyType="done"
            onSubmitEditing={handleAddDocument}
            style={styles.addDocInput}
          />
          <Pressable
            onPress={handleAddDocument}
            accessibilityRole="button"
            accessibilityLabel="Adicionar documento à lista"
            style={({ pressed }) => [styles.addDocButton, pressed && styles.addDocButtonPressed]}
          >
            <Ionicons name="add" size={24} color={colors.textOnPrimary} />
          </Pressable>
        </View>

        {fieldErrors.documentos && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <AppText variant="caption" color="danger">
              {fieldErrors.documentos}
            </AppText>
          </View>
        )}

        {documentos.length === 0 ? (
          <View style={styles.emptyDocsBox}>
            <Ionicons name="folder-open-outline" size={24} color={colors.textMuted} />
            <AppText variant="caption" color="textSecondary" align="center">
              Nenhum documento adicionado ainda. Digite acima e toque no botão +
            </AppText>
          </View>
        ) : (
          <View style={styles.docsList}>
            {documentos.map((doc, index) => (
              <View key={`${doc}-${index}`} style={styles.docChip}>
                <Ionicons name="checkmark-circle" size={18} color={colors.secondary} />
                <AppText variant="bodyMedium" style={styles.docChipText}>
                  {doc}
                </AppText>
                <Pressable
                  onPress={() => handleRemoveDocument(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover documento ${doc}`}
                  hitSlop={8}
                  style={styles.removeDocButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  addDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addDocInput: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE + 4,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  addDocButton: {
    width: MIN_TOUCH_SIZE + 4,
    height: MIN_TOUCH_SIZE + 4,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocButtonPressed: {
    opacity: 0.85,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyDocsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  docsList: {
    gap: spacing.sm,
  },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docChipText: {
    flex: 1,
  },
  removeDocButton: {
    padding: spacing.xs,
  },
});
