const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#868E96',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  gray950: '#16181B',

  indigo400: '#7C8BF5',
  indigo500: '#5B6EF5',
  indigo600: '#4A5CE0',

  red500: '#E03131',
  red600: '#C92A2A',
  amber500: '#F08C00',
  amber600: '#E67700',
  green500: '#2F9E44',
  green600: '#2B8A3E',
  blue500: '#1C7ED6',
};

export const lightColors = {
  background: palette.white,
  backgroundSecondary: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  border: palette.gray200,
  borderStrong: palette.gray300,

  text: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textInverse: palette.white,

  primary: palette.indigo500,
  primaryPressed: palette.indigo600,
  onPrimary: palette.white,

  danger: palette.red500,
  dangerPressed: palette.red600,
  warning: palette.amber500,
  success: palette.green500,
  info: palette.blue500,

  overlay: 'rgba(15, 17, 21, 0.45)',
  shadow: palette.black,
};

export const darkColors: typeof lightColors = {
  background: palette.gray950,
  backgroundSecondary: palette.gray900,
  surface: palette.gray900,
  surfaceElevated: palette.gray800,
  border: palette.gray800,
  borderStrong: palette.gray700,

  text: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,

  primary: palette.indigo400,
  primaryPressed: palette.indigo500,
  onPrimary: palette.gray950,

  danger: palette.red500,
  dangerPressed: palette.red600,
  warning: palette.amber500,
  success: palette.green500,
  info: palette.blue500,

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: palette.black,
};

export type ThemeColors = typeof lightColors;
