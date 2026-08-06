import { View, Text } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Card } from './Card';
import type { IconType } from './icon-type';

export interface StatTileProps {
  label: string;
  value: number | string;
  icon?: IconType;
  tint?: string;
  trend?: { value: string; direction: 'up' | 'down' };
  onPress?: () => void;
}

/** The app's "Statistic Card" — used for quick stats on Home, category totals on Expenses,
 * counters on Profile/Analytics. */
export function StatTile({ label, value, icon: Icon, tint, trend, onPress }: StatTileProps) {
  const { colors, spacing, typography, radius } = useTheme();
  const accent = tint ?? colors.primary;
  const TrendIcon = trend?.direction === 'down' ? TrendingDown : TrendingUp;
  const trendColor = trend?.direction === 'down' ? colors.danger : colors.success;

  return (
    <Card elevated style={{ flex: 1, minWidth: '45%' }} onPress={onPress}>
      <View style={{ gap: spacing.sm }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {Icon ? (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.button,
                backgroundColor: `${accent}1A`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} color={accent} strokeWidth={1.75} />
            </View>
          ) : null}
          {trend ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <TrendIcon size={13} color={trendColor} strokeWidth={2} />
              <Text style={[typography.caption, { color: trendColor }]}>{trend.value}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ gap: 2 }}>
          <Text style={[typography.screenTitle, { color: colors.text }]}>{value}</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
}
