import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { CalendarPlus, CheckSquare, FileText, Plus, Wallet } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/useTheme';
import { motion } from '@/theme/animations';
import { AnimatedPressable } from './AnimatedPressable';
import { AppBottomSheet } from './BottomSheet';
import type { IconType } from './icon-type';

type QuickActionRoute = '/create/task' | '/create/note' | '/create/expense' | '/create/event';

export function QuickActionFab() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  const quickActions: { label: string; icon: IconType; route: QuickActionRoute; color: string }[] =
    [
      { label: 'Task', icon: CheckSquare, route: '/create/task', color: colors.primary },
      { label: 'Note', icon: FileText, route: '/create/note', color: colors.accent },
      { label: 'Expense', icon: Wallet, route: '/create/expense', color: colors.success },
      { label: 'Event', icon: CalendarPlus, route: '/create/event', color: colors.warning },
    ];

  const handleOpen = () => {
    setOpen(true);
    rotation.value = withTiming(45, motion.timing.fast);
    sheetRef.current?.present();
  };

  const handleClose = () => {
    setOpen(false);
    rotation.value = withTiming(0, motion.timing.fast);
    sheetRef.current?.dismiss();
  };

  const handleSelect = (route: QuickActionRoute) => {
    handleClose();
    router.push(route);
  };

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close quick actions' : 'Create new item'}
        onPress={() => (open ? handleClose() : handleOpen())}
        scaleTo={0.9}
        style={[
          {
            position: 'absolute',
            alignSelf: 'center',
            bottom: insets.bottom + 94,
            width: 60,
            height: 60,
            borderRadius: radius.fab,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadows.lg,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Plus size={28} color={colors.onPrimary} strokeWidth={2.25} />
        </Animated.View>
      </AnimatedPressable>

      <AppBottomSheet
        ref={sheetRef}
        snapPoints={['34%']}
        onDismiss={() => {
          setOpen(false);
          rotation.value = withTiming(0, motion.timing.fast);
        }}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs, gap: spacing.sm }}>
          <Text style={[typography.tinyLabel, { color: colors.textTertiary }]}>QUICK ACTIONS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {quickActions.map((action, i) => (
              <Animated.View
                key={action.route}
                entering={FadeInDown.delay(i * 40)
                  .springify()
                  .damping(16)}
                style={{ flexBasis: '47%', flexGrow: 1 }}
              >
                <AnimatedPressable
                  accessibilityRole="button"
                  onPress={() => handleSelect(action.route)}
                  scaleTo={0.95}
                  style={{
                    alignItems: 'center',
                    gap: spacing.xs,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: radius.card,
                    paddingVertical: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius.button,
                      backgroundColor: `${action.color}1A`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <action.icon size={22} color={action.color} strokeWidth={1.75} />
                  </View>
                  <Text style={[typography.bodySmall, { color: colors.text }]}>{action.label}</Text>
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </AppBottomSheet>
    </>
  );
}
