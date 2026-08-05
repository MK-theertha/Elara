import { Platform } from 'react-native';
import type { ThemeColors } from './colors';

type ShadowStyle = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
};

export function createShadows(colors: ThemeColors): Record<'sm' | 'md' | 'lg', ShadowStyle> {
  const base = (offset: number, opacity: number, radius: number, elevation: number): ShadowStyle =>
    Platform.select({
      android: { elevation },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: offset },
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
    }) as ShadowStyle;

  return {
    sm: base(1, 0.06, 3, 2),
    md: base(2, 0.08, 8, 4),
    lg: base(4, 0.12, 16, 8),
  };
}
