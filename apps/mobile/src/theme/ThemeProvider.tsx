import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { darkColors, type ThemeColors } from './colors';
import { spacing, type SpacingToken } from './spacing';
import { radius, type RadiusToken } from './radius';
import { typography } from './typography';
import { createShadows } from './shadows';

export interface Theme {
  colors: ThemeColors;
  spacing: Record<SpacingToken, number>;
  radius: Record<RadiusToken, number>;
  typography: typeof typography;
  shadows: ReturnType<typeof createShadows>;
}

const ThemeContext = createContext<Theme | null>(null);

const shadows = createShadows(darkColors);
const staticTheme: Theme = { colors: darkColors, spacing, radius, typography, shadows };

/** Wraps the app once, at the root. Elara is dark-only, so this just exposes a fixed set of
 * design tokens through useTheme() — no mode resolution, no OS-scheme listening. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => staticTheme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
