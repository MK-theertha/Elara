import { Platform } from 'react-native';
import type { ThemeColors } from './colors';

type ShadowStyle = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
};

/** Soft, low-contrast elevation — the "expensive" look comes from large blur radius at low
 * opacity rather than hard, dark drop shadows. */
export function createShadows(
  colors: ThemeColors,
  isDark: boolean,
): Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', ShadowStyle> {
  const base = (
    offset: number,
    opacity: number,
    blurRadius: number,
    elevation: number,
  ): ShadowStyle =>
    Platform.select({
      android: { elevation },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: offset },
        shadowOpacity: isDark ? opacity * 1.6 : opacity,
        shadowRadius: blurRadius,
      },
    }) as ShadowStyle;

  return {
    xs: base(1, 0.04, 3, 1),
    sm: base(2, 0.05, 8, 3),
    md: base(6, 0.06, 16, 6),
    lg: base(12, 0.08, 28, 10),
    xl: base(20, 0.1, 40, 16),
  };
}
