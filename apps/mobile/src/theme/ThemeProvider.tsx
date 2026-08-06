import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { spacing, type SpacingToken } from './spacing';
import { radius, type RadiusToken } from './radius';
import { typography } from './typography';
import { createShadows } from './shadows';
import { motion } from './animations';
import { useThemeModeStore, type ThemeMode } from '@/stores/theme-store';

export interface Theme {
  colors: ThemeColors;
  spacing: Record<SpacingToken, number>;
  radius: Record<RadiusToken, number>;
  typography: typeof typography;
  shadows: ReturnType<typeof createShadows>;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<Theme | null>(null);

/** Wraps the app once, at the root. Resolves 'system' mode against the OS scheme, exposes
 * every design token through useTheme(), and plays a brief cross-fade whenever the resolved
 * theme flips (manual toggle or the OS scheme changing) so the switch never feels abrupt. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useThemeModeStore((s) => s.mode);
  const setModeAction = useThemeModeStore((s) => s.setMode);
  const hydrate = useThemeModeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const shadows = useMemo(() => createShadows(colors, isDark), [colors, isDark]);

  const fadeOpacity = useSharedValue(0);
  const isFirstRender = useRef(true);
  const previousIsDark = useRef(isDark);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousIsDark.current = isDark;
      return;
    }
    if (previousIsDark.current === isDark) return;
    previousIsDark.current = isDark;
    fadeOpacity.value = 0.35;
    fadeOpacity.value = withTiming(0, motion.timing.slow);
  }, [isDark, fadeOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: fadeOpacity.value }));

  const value = useMemo<Theme>(
    () => ({ colors, spacing, radius, typography, shadows, isDark, mode, setMode: setModeAction }),
    [colors, shadows, isDark, mode, setModeAction],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }, overlayStyle]}
      />
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
