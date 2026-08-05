import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: ErrorStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="alert"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
        gap: spacing.xs,
      }}
    >
      <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
      <Text style={[typography.subheading, { color: colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          {description}
        </Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Try again" variant="secondary" size="sm" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
