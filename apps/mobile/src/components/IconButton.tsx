import { Pressable, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  accessibilityLabel: string;
  variant?: 'plain' | 'filled';
}

export function IconButton({
  name,
  size = 22,
  color,
  accessibilityLabel,
  variant = 'plain',
  disabled,
  ...pressableProps
}: IconButtonProps) {
  const { colors, radius } = useTheme();
  const iconColor = color ?? colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled ?? undefined }}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.full,
          backgroundColor: variant === 'filled' ? colors.backgroundSecondary : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
      ]}
      {...pressableProps}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </Pressable>
  );
}
