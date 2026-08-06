import type { PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: IconType;
  size?: number;
  color?: string;
  accessibilityLabel: string;
  variant?: 'plain' | 'filled';
}

export function IconButton({
  icon: Icon,
  size = 21,
  color,
  accessibilityLabel,
  variant = 'plain',
  disabled,
  ...pressableProps
}: IconButtonProps) {
  const { colors, radius } = useTheme();
  const iconColor = color ?? colors.text;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled ?? undefined }}
      disabled={disabled}
      hitSlop={8}
      scaleTo={0.88}
      style={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.full,
        backgroundColor: variant === 'filled' ? colors.backgroundSecondary : 'transparent',
        opacity: disabled ? 0.4 : 1,
      }}
      {...pressableProps}
    >
      <Icon size={size} color={iconColor} strokeWidth={1.75} />
    </AnimatedPressable>
  );
}
