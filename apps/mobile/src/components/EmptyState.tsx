import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="text"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
        gap: spacing.xs,
      }}
    >
      <Ionicons name={icon} size={40} color={colors.textTertiary} />
      <Text style={[typography.subheading, { color: colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onActionPress ? (
        <View style={{ marginTop: spacing.sm }}>
          <Button label={actionLabel} variant="secondary" size="sm" onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}
