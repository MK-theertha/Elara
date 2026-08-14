import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CheckCircle2, ChevronLeft, Flame, TrendingUp } from 'lucide-react-native';
import { formatCurrency } from '@elara/shared';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader, Section, StatTile } from '@/components';
import { BarChart, PieChart } from '@/components/charts';
import { categoryColors } from '@/theme/colors';
import { usePreferencesStore } from '@/stores/preferences-store';
import {
  getExpenseCategories,
  getMonthlySpendTrend,
  getTaskCompletionTrend,
} from '@/lib/mock-data';

export default function AnalyticsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const currency = usePreferencesStore((s) => s.currency);

  const taskTrend = useMemo(() => getTaskCompletionTrend(), []);
  const totalCompleted = useMemo(() => taskTrend.reduce((sum, d) => sum + d.value, 0), [taskTrend]);
  const spendTrend = useMemo(() => getMonthlySpendTrend(), []);
  const categories = useMemo(() => getExpenseCategories(), []);
  const monthTotal = useMemo(() => categories.reduce((sum, c) => sum + c.amount, 0), [categories]);
  const pieData = useMemo(
    () =>
      categories.map((c) => ({
        label: c.label,
        value: Math.round((c.amount / monthTotal) * 100),
        color: categoryColors[c.color],
      })),
    [categories, monthTotal],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 140,
          gap: spacing.lg,
        }}
      >
        <View style={{ paddingHorizontal: spacing.md }}>
          <ScreenHeader
            title="Analytics"
            accessory={
              <IconButton
                icon={ChevronLeft}
                accessibilityLabel="Back"
                onPress={() => router.back()}
              />
            }
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          <StatTile
            label="Tasks this week"
            value={totalCompleted}
            icon={CheckCircle2}
            trend={{ value: '+18%', direction: 'up' }}
          />
          <StatTile label="Day streak" value={7} icon={Flame} tint={colors.warning} />
          <StatTile
            label="Spent this month"
            value={formatCurrency(monthTotal, currency)}
            icon={TrendingUp}
            tint={colors.info}
          />
        </View>

        <Section title="Tasks Completed">
          <View
            style={{
              marginHorizontal: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
            }}
          >
            <BarChart data={taskTrend} color={colors.success} />
          </View>
        </Section>

        <Section title="Spending Trend">
          <View
            style={{
              marginHorizontal: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
            }}
          >
            <BarChart data={spendTrend} />
          </View>
        </Section>

        <Section title="Spending Mix">
          <View
            style={{
              marginHorizontal: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
            }}
          >
            <PieChart
              data={pieData}
              centerValue={formatCurrency(monthTotal, currency)}
              centerLabel="total"
            />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
