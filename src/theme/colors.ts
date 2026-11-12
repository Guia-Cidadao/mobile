/**
 * Paleta de cores da identidade visual "Guia Cidadão".
 * Azul institucional (confiança), verde (serviço público / sucesso)
 * e amarelo (destaque), inspirados nas cores nacionais.
 */
export const colors = {
  primary: '#1B4D8C',
  primaryDark: '#133A6B',
  primaryLight: '#E8EFF8',

  secondary: '#12A37F',
  secondaryLight: '#E3F6F0',

  accent: '#F5B700',
  accentLight: '#FFF6D6',

  danger: '#D64545',
  dangerLight: '#FDECEC',

  background: '#F4F6FA',
  surface: '#FFFFFF',
  border: '#DDE3EC',
  overlay: 'rgba(19, 58, 107, 0.45)',

  textPrimary: '#1A2433',
  textSecondary: '#5B6575',
  textMuted: '#8A93A3',
  textOnPrimary: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
