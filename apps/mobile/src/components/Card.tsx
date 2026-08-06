import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';

export interface CardProps extends Omit<ViewProps, 'style'> {
  elevated?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({
  elevated = false,
  padded = true,
  style,
  onPress,
  children,
  ...viewProps
}: CardProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
      borderRadius: radius.card,
      borderWidth: elevated ? 0 : 1,
      borderColor: colors.border,
      padding: padded ? spacing.md : 0,
    },
    elevated ? shadows.md : null,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        onPress={onPress}
        scaleTo={0.98}
        style={cardStyle}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={cardStyle} {...viewProps}>
      {children}
    </View>
  );
}
