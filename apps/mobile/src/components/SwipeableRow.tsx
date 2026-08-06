import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { motion } from '@/theme/animations';
import type { IconType } from './icon-type';

export interface SwipeAction {
  icon: IconType;
  color: string;
  onTrigger: () => void;
}

export interface SwipeableRowProps {
  children: ReactNode;
  /** Revealed by swiping the row to the right — typically "complete". */
  leftAction?: SwipeAction;
  /** Revealed by swiping the row to the left — typically "delete". */
  rightAction?: SwipeAction;
}

const THRESHOLD = 88;

/** Generic swipe-to-act row wrapper — powers Tasks and Shopping list items. Content is
 * passed as children; this only handles the gesture, background reveal, and callback. */
export function SwipeableRow({ children, leftAction, rightAction }: SwipeableRowProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      let next = e.translationX;
      if (!leftAction) next = Math.min(next, 0);
      if (!rightAction) next = Math.max(next, 0);
      translateX.value = next;
    })
    .onEnd(() => {
      if (translateX.value > THRESHOLD && leftAction) {
        runOnJS(leftAction.onTrigger)();
      } else if (translateX.value < -THRESHOLD && rightAction) {
        runOnJS(rightAction.onTrigger)();
      }
      translateX.value = withSpring(0, motion.spring.gentle);
    });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const leftStyle = useAnimatedStyle(() => ({ opacity: translateX.value > 24 ? 1 : 0 }));
  const rightStyle = useAnimatedStyle(() => ({ opacity: translateX.value < -24 ? 1 : 0 }));

  return (
    <View style={{ overflow: 'hidden' }}>
      {leftAction ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: leftAction.color, justifyContent: 'center', paddingLeft: 24 },
            leftStyle,
          ]}
        >
          <leftAction.icon size={20} color="#FFFFFF" strokeWidth={2} />
        </Animated.View>
      ) : null}
      {rightAction ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: rightAction.color,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 24,
            },
            rightStyle,
          ]}
        >
          <rightAction.icon size={20} color="#FFFFFF" strokeWidth={2} />
        </Animated.View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
