import { memo } from 'react';
import { View, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { categoryColors, type CategoryColorKey } from '@/theme/colors';
import { usePreferencesStore } from '@/stores/preferences-store';
import { formatTimeInZone } from '@/lib/format-datetime';
import { AnimatedPressable } from '../AnimatedPressable';

export interface CalendarCardProps {
  title: string;
  start: Date;
  end: Date;
  color: CategoryColorKey;
  location?: string;
  onPress?: () => void;
}

export const CalendarCard = memo(function CalendarCard({
  title,
  start,
  end,
  color,
  location,
  onPress,
}: CalendarCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const timezone = usePreferencesStore((s) => s.timezone);
  const tint = categoryColors[color];
  const timeLabel = `${formatTimeInZone(start, timezone)} – ${formatTimeInZone(end, timezone)}`;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm + 2,
      }}
    >
      <View style={{ width: 4, borderRadius: 2, backgroundColor: tint }} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{timeLabel}</Text>
        {location ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MapPin size={11} color={colors.textTertiary} strokeWidth={1.75} />
            <Text style={[typography.caption, { color: colors.textTertiary }]} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
});
