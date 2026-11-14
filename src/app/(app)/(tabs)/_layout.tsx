import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/contexts/AuthContext';
import { colors, fonts, spacing } from '@/theme';

export default function TabsLayout() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 18,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
        },
        headerRight: () => (
          <View style={styles.headerActions}>
            <IconButton
              icon="information-circle-outline"
              accessibilityLabel="Abrir tela Sobre o App"
              onPress={() => router.push('/(app)/about')}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Serviços',
          headerTitle: 'Guia Cidadão',
          tabBarAccessibilityLabel: 'Catálogo de Serviços Públicos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={22}
              color={String(color)}
            />
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              {isAdmin && (
                <IconButton
                  icon="add-circle-outline"
                  accessibilityLabel="Cadastrar novo serviço público"
                  onPress={() => router.push('/(app)/services/form')}
                />
              )}
              <IconButton
                icon="information-circle-outline"
                accessibilityLabel="Abrir tela Sobre o App"
                onPress={() => router.push('/(app)/about')}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistente',
          headerTitle: 'Assistente Cidadão',
          tabBarAccessibilityLabel: 'Assistente Virtual de Serviços Públicos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={22}
              color={String(color)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Meu Perfil',
          headerTitle: 'Minha Conta',
          tabBarAccessibilityLabel: 'Meu Perfil e Configurações',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={String(color)}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
});
