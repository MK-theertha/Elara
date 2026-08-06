import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
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
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: `${colors.danger}12`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <AlertCircle size={32} color={colors.danger} strokeWidth={1.5} />
      </View>
      <Text style={[typography.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
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
