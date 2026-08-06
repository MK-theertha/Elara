import { View } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/useTheme';

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 140, color }: BarChartProps) {
  const { colors, typography } = useTheme();
  const tint = color ?? colors.primary;

  return (
    <View style={{ paddingRight: 12 }}>
      <GiftedBarChart
        data={data.map((d) => ({ value: d.value, label: d.label, frontColor: tint }))}
        height={height}
        barWidth={22}
        spacing={22}
        barBorderRadius={6}
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        xAxisLabelTextStyle={{
          color: colors.textSecondary,
          fontSize: typography.tinyLabel.fontSize,
        }}
        noOfSections={3}
        isAnimated
        animationDuration={500}
      />
    </View>
  );
}
