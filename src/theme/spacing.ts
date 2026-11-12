import type { ViewStyle } from 'react-native';

/** Espaçamentos baseados em grid de 4pt. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Área mínima de toque recomendada (Apple HIG 44pt / Material 48dp). */
export const MIN_TOUCH_SIZE = 48;

export const shadows = {
  card: {
    shadowColor: '#133A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#133A6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;
