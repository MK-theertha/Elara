import { Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconType;
  color?: string;
}

/** Filter/selector pill — toggleable, used for category/priority/view filters. */
export function Chip({ label, selected = false, onPress, icon: Icon, color }: ChipProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const activeColor = color ?? colors.primary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.95}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: spacing.xxs,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: selected ? activeColor : colors.border,
        backgroundColor: selected ? activeColor : colors.surface,
        minHeight: 36,
        justifyContent: 'center',
      }}
    >
      {Icon ? (
        <Icon
          size={14}
          color={selected ? colors.onPrimary : colors.textSecondary}
          strokeWidth={2}
        />
      ) : null}
      <Text
        style={[typography.caption, { color: selected ? colors.onPrimary : colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export interface TagProps {
  label: string;
  color?: string;
}

/** Small static label — categories on cards, non-interactive. */
export function Tag({ label, color }: TagProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const tint = color ?? colors.primary;

  return (
    <Text
      style={[
        typography.tinyLabel,
        {
          color: tint,
          backgroundColor: `${tint}1A`,
          borderRadius: radius.chip,
          paddingHorizontal: spacing.xs,
          paddingVertical: 3,
          overflow: 'hidden',
        },
      ]}
      numberOfLines={1}
    >
      {label.toUpperCase()}
    </Text>
  );
}
