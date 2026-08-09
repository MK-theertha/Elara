import type { TextStyle } from 'react-native';

type TextPreset = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

/** Plus Jakarta Sans, loaded via @expo-google-fonts/plus-jakarta-sans in the root layout
 * (see app/_layout.tsx). Presets carry the weight in fontFamily itself
 * (PlusJakartaSans_600SemiBold etc.) rather than a separate fontWeight — mixing the two is
 * unreliable on Android with custom fonts. */
export const typography = {
  displayLarge: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 34, lineHeight: 40 },
  screenTitle: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, lineHeight: 32 },
  sectionTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, lineHeight: 24 },
  cardTitle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, lineHeight: 18 },
  tinyLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
} satisfies Record<string, TextPreset>;

export type TypographyToken = keyof typeof typography;
