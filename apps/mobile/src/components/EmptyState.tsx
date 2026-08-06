import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Button } from './Button';
import type { IconType } from './icon-type';

export interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onActionPress,
  secondaryLabel,
  onSecondaryPress,
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
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: `${colors.primary}12`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Icon size={32} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={[typography.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          {description}
        </Text>
      ) : null}
      {(actionLabel && onActionPress) || (secondaryLabel && onSecondaryPress) ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          {secondaryLabel && onSecondaryPress ? (
            <Button label={secondaryLabel} variant="ghost" size="sm" onPress={onSecondaryPress} />
          ) : null}
          {actionLabel && onActionPress ? (
            <Button label={actionLabel} variant="secondary" size="sm" onPress={onActionPress} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
