import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/useTheme';

export interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

/** Very subtle frosted-glass surface — used sparingly (nav bar, hero overlays, AI screen)
 * per the "glassmorphism (very subtle)" brief, not as the default card treatment. */
export function GlassCard({ children, style, intensity = 40 }: GlassCardProps) {
  const { colors, radius, isDark } = useTheme();

  return (
    <View style={[{ borderRadius: radius.card, overflow: 'hidden' }, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(26, 29, 36, 0.55)' : 'rgba(255, 255, 255, 0.55)' },
        ]}
      />
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.card }}>
        {children}
      </View>
    </View>
  );
}
