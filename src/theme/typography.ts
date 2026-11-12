import type { TextStyle } from 'react-native';

/**
 * Mapeamento das fontes Poppins carregadas em `assets/fonts`.
 * As chaves são os nomes registrados em `useFonts` no layout raiz.
 */
export const fontFiles = {
  'Poppins-Regular': require('../../assets/fonts/Poppins_400Regular.ttf'),
  'Poppins-Medium': require('../../assets/fonts/Poppins_500Medium.ttf'),
  'Poppins-SemiBold': require('../../assets/fonts/Poppins_600SemiBold.ttf'),
  'Poppins-Bold': require('../../assets/fonts/Poppins_700Bold.ttf'),
};

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

/** Escala tipográfica (tamanhos mínimos seguem as guidelines de legibilidade). */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36 },
  title: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 30 },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
