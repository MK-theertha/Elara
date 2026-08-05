import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        gap: spacing.sm,
      }}
    >
      <ActivityIndicator size="small" color={colors.primary} />
      {label ? (
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
    </View>
  );
}
