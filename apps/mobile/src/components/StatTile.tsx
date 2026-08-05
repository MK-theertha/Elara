import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Card } from './Card';

export interface StatTileProps {
  label: string;
  value: number | string;
}

export function StatTile({ label, value }: StatTileProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Card style={{ flex: 1, minWidth: '45%' }}>
      <View style={{ gap: spacing.xxs }}>
        <Text style={[typography.title, { color: colors.text }]}>{value}</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Card>
  );
}
