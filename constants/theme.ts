export const colors = {
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
} as const;

export const radii = { card: 16 } as const;
export const spacing = { gutter: 16, vgap: 24 } as const;

export const grid = {
  maxWidth: 1440,
  columns: 12,
  gutter: spacing.gutter,
} as const;
