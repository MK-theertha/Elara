import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { useToastStore, type ToastTone } from '@/stores/toast-store';
import { AnimatedPressable } from './AnimatedPressable';

const AUTO_DISMISS_MS = 3000;

export function ToastHost() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  const toneIcon: Record<ToastTone, typeof Info> = {
    neutral: Info,
    success: CheckCircle2,
    danger: XCircle,
  };
  const toneColor: Record<ToastTone, string> = {
    neutral: colors.text,
    success: colors.success,
    danger: colors.danger,
  };
  const ToneIcon = toneIcon[toast.tone];

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: insets.bottom + spacing.md,
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        shadows.lg,
      ]}
    >
      <ToneIcon size={18} color={toneColor[toast.tone]} strokeWidth={2} />
      <Text style={[typography.bodySmall, { color: colors.text, flex: 1 }]}>{toast.message}</Text>
      {toast.action ? (
        <AnimatedPressable
          accessibilityRole="button"
          onPress={() => {
            toast.action?.onPress();
            dismiss();
          }}
          hitSlop={8}
          scaleTo={0.92}
        >
          <View>
            <Text style={[typography.caption, { color: colors.primary }]}>
              {toast.action.label}
            </Text>
          </View>
        </AnimatedPressable>
      ) : null}
    </Animated.View>
  );
}
