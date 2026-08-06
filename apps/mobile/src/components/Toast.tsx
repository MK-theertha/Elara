import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { useToastStore, type ToastTone } from '@/stores/toast-store';

const AUTO_DISMISS_MS = 3000;

export function ToastHost() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  const toneColors: Record<ToastTone, string> = {
    neutral: colors.text,
    success: colors.success,
    danger: colors.danger,
  };

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: spacing.md,
        right: spacing.md,
        bottom: insets.bottom + spacing.md,
        backgroundColor: toneColors[toast.tone],
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
      }}
    >
      <Text style={[typography.bodySmall, { color: colors.textInverse, flex: 1 }]}>
        {toast.message}
      </Text>
      {toast.action ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.action?.onPress();
            dismiss();
          }}
          hitSlop={8}
        >
          <View>
            <Text style={[typography.bodySmall, { color: colors.textInverse, fontWeight: '700' }]}>
              {toast.action.label}
            </Text>
          </View>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
