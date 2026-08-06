import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

/** Single source of truth for motion — every animated component pulls from here instead
 * of hand-rolling spring/timing numbers, so the whole app moves with one consistent feel. */
export const motion = {
  spring: {
    /** Buttons, chips, list-item press feedback — quick, decisive settle. */
    snappy: { damping: 18, stiffness: 260, mass: 0.6 } satisfies WithSpringConfig,
    /** Cards, FAB, bottom sheets — a touch more travel and weight. */
    gentle: { damping: 16, stiffness: 160, mass: 0.8 } satisfies WithSpringConfig,
    /** Success checkmarks, completion pops — bouncy, celebratory. */
    bouncy: { damping: 10, stiffness: 180, mass: 0.7 } satisfies WithSpringConfig,
  },
  timing: {
    fast: { duration: 150, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
    base: { duration: 250, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
    slow: { duration: 400, easing: Easing.inOut(Easing.cubic) } satisfies WithTimingConfig,
  },
  press: {
    /** Scale applied to pressable surfaces on press-in. */
    scale: 0.96,
  },
} as const;
