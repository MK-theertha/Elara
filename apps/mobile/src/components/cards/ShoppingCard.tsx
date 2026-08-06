import { View, Text } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { categoryColors, type CategoryColorKey } from '@/theme/colors';
import { AnimatedPressable } from '../AnimatedPressable';
import { ProgressRing } from '../ProgressRing';

export interface ShoppingCardProps {
  name: string;
  store: string;
  color: CategoryColorKey;
  purchasedCount: number;
  totalCount: number;
  estimate: number;
  onPress?: () => void;
}

export function ShoppingCard({
  name,
  store,
  color,
  purchasedCount,
  totalCount,
  estimate,
  onPress,
}: ShoppingCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const tint = categoryColors[color];
  const ratio = totalCount > 0 ? purchasedCount / totalCount : 0;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm + 2,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.button,
          backgroundColor: `${tint}1A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShoppingBag size={20} color={tint} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {store} · {purchasedCount}/{totalCount} · ${estimate.toFixed(2)}
        </Text>
      </View>
      <ProgressRing
        progress={ratio}
        size={38}
        strokeWidth={4}
        color={tint}
        showPercentage={false}
      />
    </AnimatedPressable>
  );
}
