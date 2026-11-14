import { Stack } from 'expo-router';

import { colors, fonts } from '@/theme';

export default function AppStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 18,
        },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="services/[id]" options={{ title: 'Detalhes do Serviço' }} />
      <Stack.Screen name="services/form" options={{ title: 'Serviço Público' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="about" options={{ title: 'Sobre o App' }} />
    </Stack>
  );
}
