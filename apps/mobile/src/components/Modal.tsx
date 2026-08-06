import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Centered modal with a blurred backdrop — confirmation dialogs, small pickers. Larger
 * flows (quick add, filters) should use BottomSheet instead. */
export function AppModal({ visible, onClose, children }: AppModalProps) {
  const { colors, spacing, radius, shadows, isDark } = useTheme();

  if (!visible) return null;

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }}>
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={onClose}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        >
          <BlurView
            intensity={30}
            tint={isDark ? 'dark' : 'light'}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.card,
                    padding: spacing.lg,
                    minWidth: 280,
                    maxWidth: 360,
                  },
                  shadows.xl,
                ]}
              >
                {children}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </RNModal>
  );
}
