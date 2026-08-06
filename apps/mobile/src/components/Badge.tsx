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
    primary: { bg: `${colors.primary}1A`, fg: colors.primary },
    danger: { bg: `${colors.danger}1A`, fg: colors.danger },
    warning: { bg: `${colors.warning}1A`, fg: colors.warning },
    success: { bg: `${colors.success}1A`, fg: colors.success },
    info: { bg: `${colors.info}1A`, fg: colors.info },
  };
  const { bg, fg } = toneColors[tone];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.chip,
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
