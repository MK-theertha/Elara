import { StyleSheet, type PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

export interface FloatingButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconType;
  accessibilityLabel: string;
  size?: number;
  tone?: 'primary' | 'surface';
}

/** Generic circular floating action button — used for "add event", "add note", etc. on
 * screens that need one obvious floating affordance. The Home/tab-bar quick-add FAB with its
 * expanding menu lives separately in QuickActionFab. */
export function FloatingButton({
  icon: Icon,
  accessibilityLabel,
  size = 56,
  tone = 'primary',
  ...pressableProps
}: FloatingButtonProps) {
  const { colors, radius, shadows } = useTheme();

  const backgroundColor = tone === 'primary' ? colors.primary : colors.surfaceElevated;
  const iconColor = tone === 'primary' ? colors.onPrimary : colors.primary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.92}
      style={[
        styles.base,
        shadows.lg,
        {
          width: size,
          height: size,
          borderRadius: radius.fab,
          backgroundColor,
        },
      ]}
      {...pressableProps}
    >
      <Icon size={size * 0.42} color={iconColor} strokeWidth={2} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
