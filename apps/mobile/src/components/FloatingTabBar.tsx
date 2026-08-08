import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { usePathname, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Calendar, CheckSquare, Home, LayoutGrid, Wallet } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { motion } from '@/theme/animations';
import { AnimatedPressable } from './AnimatedPressable';
import type { IconType } from './icon-type';

interface TabDef {
  key: string;
  label: string;
  icon: IconType;
  route: '/(tabs)' | '/(tabs)/tasks' | '/(tabs)/calendar' | '/(tabs)/expenses' | '/(tabs)/more';
  isActive: (pathname: string) => boolean;
}

const TABS: TabDef[] = [
  { key: 'home', label: 'Home', icon: Home, route: '/(tabs)', isActive: (p) => p === '/' },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    route: '/(tabs)/tasks',
    isActive: (p) => p.startsWith('/tasks'),
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    route: '/(tabs)/calendar',
    isActive: (p) => p.startsWith('/calendar'),
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: Wallet,
    route: '/(tabs)/expenses',
    isActive: (p) => p.startsWith('/expenses'),
  },
  {
    key: 'more',
    label: 'More',
    icon: LayoutGrid,
    route: '/(tabs)/more',
    isActive: (p) => p.startsWith('/more'),
  },
];

/** Custom floating tab bar rendered as a sibling to expo-router's <Tabs> (whose own tab bar
 * is hidden via tabBarStyle: { display: 'none' } in (tabs)/_layout.tsx). Reads the active
 * tab from the router pathname rather than react-navigation's tabBar render-prop, keeping
 * this independent of expo-router's internal navigator typing. */
export function FloatingTabBar() {
  const { colors, spacing, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [barWidth, setBarWidth] = useState(0);

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.isActive(pathname)),
  );
  const segmentWidth = barWidth / TABS.length;

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: withTiming(segmentWidth * activeIndex, motion.timing.fast) }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
        bottom: insets.bottom + spacing.xs,
      }}
    >
      <View style={[{ borderRadius: 32, overflow: 'hidden' }, shadows.lg]}>
        <BlurView intensity={50} tint="dark">
          <View
            onLayout={handleLayout}
            style={{
              flexDirection: 'row',
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.xs,
              backgroundColor: 'rgba(26, 29, 36, 0.72)',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {barWidth > 0 ? (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: spacing.xs,
                    bottom: spacing.xs,
                    left: 0,
                    borderRadius: 24,
                    backgroundColor: `${colors.primary}1F`,
                  },
                  indicatorStyle,
                ]}
              />
            ) : null}
            {TABS.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <AnimatedPressable
                  key={tab.key}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => router.navigate(tab.route)}
                  scaleTo={0.9}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    paddingVertical: spacing.xs,
                  }}
                >
                  <tab.icon
                    size={22}
                    color={active ? colors.primary : colors.textTertiary}
                    strokeWidth={active ? 2.1 : 1.75}
                  />
                  <Text
                    style={[
                      typography.tinyLabel,
                      { color: active ? colors.primary : colors.textTertiary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}
