import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';

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
        <Text style={[typography.heading, { color: colors.text }]}>{title}</Text>
        {actionLabel && onActionPress ? (
          <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={8}>
            <Text style={[typography.bodySmall, { color: colors.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
