import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ServiceCard } from '@/components/services/ServiceCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/services/api/apiError';
import { servicoService } from '@/services/servicoService';
import { colors, fonts, MIN_TOUCH_SIZE, radius, spacing } from '@/theme';
import type { Servico } from '@/types/servico';

const PAGE_SIZE = 10;

export default function ServicesCatalogScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [services, setServices] = useState<Servico[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFirstPage = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await servicoService.list({ page: 0, size: PAGE_SIZE });
      setServices(response.items);
      setPage(response.page);
      setTotalElements(response.totalElements);
      setIsLastPage(response.isLast);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFirstPage(false);
    }, [loadFirstPage]),
  );

  async function handleLoadMore() {
    if (isLastPage || isLoadingMore || isLoading || searchQuery.trim().length > 0) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await servicoService.list({ page: nextPage, size: PAGE_SIZE });
      setServices((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = response.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      setPage(response.page);
      setTotalElements(response.totalElements);
      setIsLastPage(response.isLast);
    } catch {
      // Falha silenciosa na paginação incremental; o usuário pode puxar para atualizar
    } finally {
      setIsLoadingMore(false);
    }
  }

  const filteredServices = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return services;
    }
    return services.filter(
      (item) =>
        item.nome.toLowerCase().includes(normalized) ||
        item.descricao.toLowerCase().includes(normalized) ||
        item.documentos.some((doc) => doc.toLowerCase().includes(normalized)),
    );
  }, [searchQuery, services]);

  if (isLoading) {
    return <LoadingState message="Carregando serviços públicos..." />;
  }

  if (errorMessage && services.length === 0) {
    return <ErrorState message={errorMessage} onRetry={() => loadFirstPage(true)} />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void loadFirstPage(false);
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.welcomeBanner}>
              <View style={styles.welcomeTexts}>
                <AppText variant="subtitle" color="textOnPrimary">
                  {`Olá, ${user?.nome?.split(' ')[0] ?? 'Cidadão'}!`}
                </AppText>
                <AppText variant="caption" color="textOnPrimary" style={styles.welcomeSubtitle}>
                  Consulte documentos e requisitos dos serviços públicos oficiais.
                </AppText>
              </View>
              <View style={styles.counterBadge}>
                <AppText variant="title" color="primary">
                  {String(totalElements)}
                </AppText>
                <AppText variant="caption" color="primary">
                  serviços
                </AppText>
              </View>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por serviço ou documento (ex.: RG, CPF)..."
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Buscar serviço público"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {isAdmin && (
              <AppButton
                title="Cadastrar novo serviço público"
                icon="add-circle-outline"
                variant="secondary"
                onPress={() => router.push('/(app)/services/form')}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ServiceCard
            servico={item}
            onPress={() =>
              router.push({
                pathname: '/(app)/services/[id]',
                params: { id: String(item.id) },
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={
              searchQuery.trim() ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado ainda'
            }
            description={
              searchQuery.trim()
                ? 'Tente buscar por outro termo ou pergunte ao nosso Assistente Cidadão.'
                : isAdmin
                  ? 'Cadastre o primeiro serviço público para disponibilizá-lo aos cidadãos.'
                  : 'Novos serviços públicos serão disponibilizados em breve.'
            }
            action={
              searchQuery.trim() ? (
                <AppButton
                  title="Limpar filtro"
                  variant="outline"
                  onPress={() => setSearchQuery('')}
                />
              ) : undefined
            }
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  headerContainer: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  welcomeTexts: {
    flex: 1,
    gap: spacing.xs,
  },
  welcomeSubtitle: {
    opacity: 0.9,
  },
  counterBadge: {
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_SIZE + 4,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
