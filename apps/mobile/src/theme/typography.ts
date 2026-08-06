import type { TextStyle } from 'react-native';

type TextPreset = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

/** Inter, loaded via @expo-google-fonts/inter in the root layout (see app/_layout.tsx).
 * Presets carry the weight in fontFamily itself (Inter_600SemiBold etc.) rather than a
 * separate fontWeight — mixing the two is unreliable on Android with custom fonts. */
export const typography = {
  displayLarge: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 40 },
  screenTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 32 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: 'Inter_500Medium', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18 },
  tinyLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
} satisfies Record<string, TextPreset>;

export type TypographyToken = keyof typeof typography;
