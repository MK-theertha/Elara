import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { darkColors, lightColors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';
import { createShadows } from './shadows';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const shadows = useMemo(() => createShadows(colors), [colors]);

  return { colors, spacing, radius, typography, shadows, isDark };
}

export type Theme = ReturnType<typeof useTheme>;
