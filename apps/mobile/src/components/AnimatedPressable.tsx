import { Pressable, type StyleProp, type ViewStyle, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '@/theme/animations';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/** Shared press-feedback primitive — every interactive component (Button, Card, Chip, ...)
 * builds on this instead of the old opacity-on-press pattern, so the whole app presses
 * with the same soft spring. */
export function AnimatedPressable({
  scaleTo = motion.press.scale,
  style,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, motion.spring.snappy);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, motion.spring.snappy);
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
}
