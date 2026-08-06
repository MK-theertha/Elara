import { Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { motion } from '@/theme/animations';
import { AnimatedPressable } from './AnimatedPressable';

export interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  accessibilityLabel: string;
}

/** Circular checkbox with a bounce-and-fill completion animation — the "animated
 * completion" interaction shared by Tasks and Shopping list items. */
export function Checkbox({
  checked,
  onToggle,
  color,
  size = 24,
  accessibilityLabel,
}: CheckboxProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  const bounce = useSharedValue(1);

  const handlePress = () => {
    bounce.value = withSequence(
      withTiming(0.7, { duration: 80 }),
      withSpring(1, motion.spring.bouncy),
    );
    onToggle();
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
    backgroundColor: withTiming(checked ? tint : 'transparent', motion.timing.fast),
    borderColor: withTiming(checked ? tint : colors.borderStrong, motion.timing.fast),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      hitSlop={8}
      scaleTo={1}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          circleStyle,
        ]}
      >
        {checked ? <Check size={size * 0.62} color={colors.onPrimary} strokeWidth={3} /> : null}
      </Animated.View>
    </AnimatedPressable>
  );
}
