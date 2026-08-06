import { ActivityIndicator, StyleSheet, Text, type PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: IconType;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  disabled,
  ...pressableProps
}: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.backgroundSecondary,
    ghost: 'transparent',
    danger: colors.danger,
  };
  const textColor: Record<ButtonVariant, string> = {
    primary: colors.onPrimary,
    secondary: colors.text,
    ghost: colors.primary,
    danger: colors.onPrimary,
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      scaleTo={0.97}
      style={[
        styles.base,
        {
          backgroundColor: backgroundColor[variant],
          borderRadius: radius.button,
          paddingVertical: size === 'sm' ? spacing.xs : spacing.sm + 2,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          gap: spacing.xxs,
        },
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor[variant]} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={textColor[variant]} strokeWidth={2} /> : null}
          <Text
            style={[typography.bodyMedium, { color: textColor[variant], textAlign: 'center' }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
