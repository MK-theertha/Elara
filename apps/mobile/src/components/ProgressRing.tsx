import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { motion } from '@/theme/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 7,
  color,
  label,
  showPercentage = true,
}: ProgressRingProps) {
  const { colors, typography } = useTheme();
  const tint = color ?? colors.primary;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));

  const animatedProgress = useSharedValue(0);
  useEffect(() => {
    animatedProgress.value = withTiming(clamped, motion.timing.slow);
  }, [clamped, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tint}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showPercentage || label ? (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {showPercentage ? (
            <Text style={[typography.cardTitle, { color: colors.text }]}>
              {Math.round(clamped * 100)}%
            </Text>
          ) : null}
          {label ? (
            <Text style={[typography.tinyLabel, { color: colors.textSecondary }]}>{label}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
