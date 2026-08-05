import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type BadgeTone = 'neutral' | 'primary' | 'danger' | 'warning' | 'success' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.backgroundSecondary, fg: colors.textSecondary },
    primary: { bg: colors.primary, fg: colors.onPrimary },
    danger: { bg: colors.danger, fg: colors.onPrimary },
    warning: { bg: colors.warning, fg: colors.onPrimary },
    success: { bg: colors.success, fg: colors.onPrimary },
    info: { bg: colors.info, fg: colors.onPrimary },
  };
  const { bg, fg } = toneColors[tone];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.xs,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={[typography.caption, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
