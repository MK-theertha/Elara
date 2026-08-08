import { Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

/** Gives the "More" tab its own nested Stack (proper push/pop + swipe-back) instead of
 * relying on the outer Tabs navigator, which has no history for undeclared screens.
 * Every screen here supplies its own back affordance via ScreenHeader's accessory slot,
 * except the two detail screens that opt back into a native header (title + actions). */
export default function MoreLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
