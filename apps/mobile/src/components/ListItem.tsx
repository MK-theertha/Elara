import { View, Text, type GestureResponderEvent } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: IconType;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export function ListItem({
  title,
  subtitle,
  leadingIcon: LeadingIcon,
  trailing,
  showChevron = false,
  onPress,
}: ListItemProps) {
  const { colors, spacing, typography } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 56,
        gap: spacing.sm,
      }}
    >
      {LeadingIcon ? (
        <LeadingIcon size={20} color={colors.textSecondary} strokeWidth={1.75} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? (
        <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.75} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable accessibilityRole="button" onPress={onPress} scaleTo={0.98}>
      {content}
    </AnimatedPressable>
  );
}
