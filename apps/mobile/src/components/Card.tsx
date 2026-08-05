import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export function Card({
  elevated = false,
  padded = true,
  style,
  children,
  ...viewProps
}: CardProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: radius.lg,
          borderWidth: elevated ? 0 : 1,
          borderColor: colors.border,
          padding: padded ? spacing.md : 0,
        },
        elevated ? shadows.md : null,
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}
