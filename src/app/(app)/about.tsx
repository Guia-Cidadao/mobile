import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { env } from '@/config/env';
import { getActiveApiUrl } from '@/services/api/httpClient';
import { colors, fonts, radius, spacing } from '@/theme';

interface InfoRowProps {
  label: string;
  value: string;
  monospace?: boolean;
}

function InfoRow({ label, value, monospace = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText
        variant="bodyMedium"
        selectable
        style={monospace ? styles.monospaceValue : undefined}
      >
        {value}
      </AppText>
    </View>
  );
}

export default function AboutScreen() {
  const formattedBuildDate = env.buildDate
    ? new Date(env.buildDate).toLocaleString('pt-BR')
    : 'Ambiente de desenvolvimento';

  return (
    <ScreenContainer>
      <Card style={styles.brandCard}>
        <View style={styles.logoBox}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logotipo do Guia Cidadão"
          />
        </View>
        <AppText variant="title" color="primary" align="center">
          {env.appName}
        </AppText>
        <AppText variant="body" color="textSecondary" align="center">
          Plataforma mobile CitizenTech para consulta descomplicada de serviços públicos, documentos
          obrigatórios e orientação cidadã com inteligência artificial.
        </AppText>
        <View style={styles.versionPill}>
          <AppText variant="caption" color="primary">
            {`Versão ${env.appVersion}`}
          </AppText>
        </View>
      </Card>

      <Card style={styles.commitCard}>
        <View style={styles.commitHeader}>
          <Ionicons name="git-commit-outline" size={22} color={colors.secondary} />
          <AppText variant="subtitle" color="secondary">
            Hash do Commit de Referência
          </AppText>
        </View>
        <AppText variant="caption" color="textSecondary">
          Identificador exato da revisão do código-fonte utilizada para gerar esta versão do
          aplicativo (Requisito 7 — Publicação):
        </AppText>
        <View style={styles.commitBox}>
          <AppText variant="bodyMedium" color="primary" selectable style={styles.commitHashText}>
            {env.commitHash}
          </AppText>
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Especificações Técnicas</AppText>
        <InfoRow label="Aplicativo" value={env.appName} />
        <InfoRow label="Versão da Build" value={env.appVersion} />
        <InfoRow label="Data da Build" value={formattedBuildDate} />
        <InfoRow label="Endpoint da API REST" value={getActiveApiUrl()} monospace />
        <InfoRow label="Stack Mobile" value="React Native + Expo Router + TypeScript + Axios" />
        <InfoRow
          label="Stack Backend"
          value="Java 21 + Spring Boot 3 + Spring Security JWT + PostgreSQL"
        />
      </Card>

      <Card>
        <AppText variant="subtitle">Global Solution · FIAP CitizenTech</AppText>
        <AppText variant="body" color="textSecondary">
          Desenvolvido seguindo as diretrizes de usabilidade, acessibilidade (Apple HIG / Material
          Design), arquitetura em camadas e integração RESTful completa.
        </AppText>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logo: {
    width: 56,
    height: 56,
  },
  versionPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  commitCard: {
    borderWidth: 1.5,
    borderColor: colors.secondary,
    gap: spacing.sm,
  },
  commitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commitBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commitHashText: {
    fontFamily: fonts.semiBold,
    letterSpacing: 0.5,
  },
  infoRow: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 2,
  },
  monospaceValue: {
    fontSize: 14,
  },
});
