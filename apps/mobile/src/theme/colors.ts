const palette = {
  white: '#FFFFFF',
  black: '#000000',

  gray400: '#9CA3AF',
  gray600: '#4B5264',
  gray900: '#111827',

  ink950: '#0F1115',
  ink900: '#14161C',
  ink800: '#1A1D24',
  ink700: '#20242D',
  ink600: '#2B303C',

  indigo500: '#5B5FEF',
  indigo700: '#6D71F2',

  violet500: '#7B61FF',

  green500: '#30D158',
  amber500: '#FF9F0A',
  red500: '#FF453A',
  blue500: '#0A84FF',
};

/** Elara is dark-only by design — there is no light palette to switch to. */
export const darkColors = {
  background: palette.ink950,
  backgroundSecondary: palette.ink900,
  surface: palette.ink800,
  surfaceElevated: palette.ink700,
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',

  text: '#F3F4F6',
  textSecondary: palette.gray400,
  textTertiary: palette.gray600,
  textInverse: palette.gray900,

  primary: palette.indigo500,
  primaryPressed: palette.indigo700,
  accent: palette.violet500,
  onPrimary: palette.white,

  danger: palette.red500,
  dangerPressed: '#FF6259',
  warning: palette.amber500,
  success: palette.green500,
  info: palette.blue500,

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: palette.black,
  skeletonBase: palette.ink600,
  skeletonHighlight: palette.ink700,
};

/** Category/priority colors — shared across Tasks, Calendar, Shopping, Notes so a given
 * category reads consistently everywhere it appears. */
export const categoryColors = {
  indigo: palette.indigo500,
  violet: palette.violet500,
  green: palette.green500,
  amber: palette.amber500,
  red: palette.red500,
  blue: palette.blue500,
  pink: '#FF6FB0',
  teal: '#12B7A8',
} as const;

export type ThemeColors = typeof darkColors;
export type CategoryColorKey = keyof typeof categoryColors;
