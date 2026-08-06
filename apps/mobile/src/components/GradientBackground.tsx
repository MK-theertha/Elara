import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';

export interface GradientBackgroundProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'brand' | 'subtle';
}

/** Indigo → violet gradient surface — used for the AI card/screen and other hero moments,
 * kept out of everyday cards so it stays a highlight rather than the norm. */
export function GradientBackground({
  children,
  style,
  variant = 'brand',
}: GradientBackgroundProps) {
  const { colors, isDark } = useTheme();

  const gradientColors =
    variant === 'brand'
      ? ([colors.primary, colors.accent] as const)
      : isDark
        ? (['rgba(91,95,239,0.16)', 'rgba(123,97,255,0.05)'] as const)
        : (['rgba(91,95,239,0.10)', 'rgba(123,97,255,0.03)'] as const);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
