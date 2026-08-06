import { View, Text } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartSlice[];
  centerLabel?: string;
  centerValue?: string;
  radius?: number;
}

export function PieChart({ data, centerLabel, centerValue, radius = 78 }: PieChartProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
      <GiftedPieChart
        data={data.map((d) => ({ value: d.value, color: d.color }))}
        donut
        radius={radius}
        innerRadius={radius * 0.62}
        innerCircleColor={colors.surface}
        centerLabelComponent={
          centerValue
            ? () => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[typography.cardTitle, { color: colors.text }]}>{centerValue}</Text>
                  {centerLabel ? (
                    <Text style={[typography.tinyLabel, { color: colors.textSecondary }]}>
                      {centerLabel}
                    </Text>
                  ) : null}
                </View>
              )
            : undefined
        }
      />
      <View style={{ flex: 1, gap: spacing.xs }}>
        {data.map((slice) => (
          <View
            key={slice.label}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: slice.color }} />
            <Text style={[typography.bodySmall, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {slice.label}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {slice.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
