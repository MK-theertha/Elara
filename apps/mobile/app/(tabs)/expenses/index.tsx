import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { EmptyState, ScreenHeader, StatTile } from '@/components';

export default function ExpensesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: spacing.xxxl,
        gap: spacing.lg,
      }}
    >
      <ScreenHeader title="Expenses" />

      <View
        style={{
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        <StatTile label="Today" value="$0.00" />
        <StatTile label="This week" value="$0.00" />
        <StatTile label="This month" value="$0.00" />
      </View>

      <View style={{ paddingHorizontal: spacing.md }}>
        <EmptyState
          icon="cash-outline"
          title="No expenses yet"
          description="Expenses you log will show up here, with charts for spending by category and over time."
        />
      </View>
    </ScrollView>
  );
}
