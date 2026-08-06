import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';

export interface SectionProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
}

export function Section({ title, actionLabel, onActionPress, children }: SectionProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
        }}
      >
        <Text style={[typography.sectionTitle, { color: colors.text }]}>{title}</Text>
        {actionLabel && onActionPress ? (
          <AnimatedPressable
            accessibilityRole="button"
            onPress={onActionPress}
            hitSlop={8}
            scaleTo={0.94}
          >
            <Text style={[typography.caption, { color: colors.primary }]}>{actionLabel}</Text>
          </AnimatedPressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
