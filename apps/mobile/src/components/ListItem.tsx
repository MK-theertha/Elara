import { Pressable, View, Text, type GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export function ListItem({
  title,
  subtitle,
  leadingIcon,
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
      {leadingIcon ? <Ionicons name={leadingIcon} size={22} color={colors.textSecondary} /> : null}
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
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}
