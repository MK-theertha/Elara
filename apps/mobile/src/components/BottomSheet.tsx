import { forwardRef, useCallback, useMemo, type ReactNode } from 'react';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/useTheme';

export interface AppBottomSheetProps {
  children: ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
}

/** Themed wrapper around @gorhom/bottom-sheet — radius 32 top corners, drag handle, dimmed
 * backdrop. Callers hold a ref and call .present()/.dismiss() (standard gorhom API). */
export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function AppBottomSheet({ children, snapPoints, onDismiss }, ref) {
    const { colors, radius } = useTheme();
    const points = useMemo(() => snapPoints ?? ['50%'], [snapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={points}
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: radius.bottomSheet,
          borderTopRightRadius: radius.bottomSheet,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 40 }}
      >
        <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
      </BottomSheetModal>
    );
  },
);
