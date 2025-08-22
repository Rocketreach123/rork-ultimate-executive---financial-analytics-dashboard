export type ThemeMode = 'dark' | 'light';

export type ThemeColors = {
  bg: string;
  card: string;
  surface: string;
  border: string;
  text: string;
  subtle: string;
  primary: string;
  primaryAlt: string;
  success: string;
  warning: string;
  danger: string;
  error: string;
};

export const darkColors: ThemeColors = {
  bg: '#0B0D12',
  card: '#121521',
  surface: '#1B2031',
  border: '#2A3145',
  text: '#E5E7EB',
  subtle: '#9CA3AF',
  primary: '#22D3EE',
  primaryAlt: '#6EE7F3',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  error: '#F87171',
} as const;

export const lightColors: ThemeColors = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#0F172A',
  subtle: '#475569',
  primary: '#0EA5E9',
  primaryAlt: '#38BDF8',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  error: '#DC2626',
} as const;

export const radii = { card: 16 } as const;
export const spacing = { gutter: 16, vgap: 24 } as const;

export const grid = {
  maxWidth: 1440,
  columns: 12,
  gutter: spacing.gutter,
} as const;
