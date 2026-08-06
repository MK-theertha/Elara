import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PiggyBank, Plus, Receipt, Target } from 'lucide-react-native';
import { formatCurrency } from '@elara/shared';
import { useTheme } from '@/theme/useTheme';
import { FloatingButton, ScreenHeader, Section, StatTile, Tag } from '@/components';
import { BarChart, PieChart } from '@/components/charts';
import { categoryColors } from '@/theme/colors';
import { getExpenseCategories, getMonthlySpendTrend, getRecentTransactions } from '@/lib/mock-data';

const MONTHLY_BUDGET = 2000;
const SAVINGS_GOAL = 5000;
const SAVINGS_CURRENT = 3120;

function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.backgroundSecondary,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.min(100, ratio * 100)}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export default function ExpensesScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const categories = getExpenseCategories();
  const monthTotal = categories.reduce((sum, c) => sum + c.amount, 0);
  const trend = getMonthlySpendTrend();
  const transactions = getRecentTransactions();
  const pieData = categories.map((c) => ({
    label: c.label,
    value: Math.round((c.amount / monthTotal) * 100),
    color: categoryColors[c.color],
  }));
  const budgetRatio = monthTotal / MONTHLY_BUDGET;
  const savingsRatio = SAVINGS_CURRENT / SAVINGS_GOAL;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Expenses" />
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          gap: spacing.lg,
          paddingBottom: insets.bottom + 140,
        }}
      >
        <View style={{ gap: 2 }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>This month</Text>
          <Text style={[typography.displayLarge, { color: colors.text }]}>
            {formatCurrency(monthTotal, 'USD')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <StatTile
            label="Avg / day"
            value={formatCurrency(monthTotal / 30, 'USD')}
            icon={Receipt}
          />
          <StatTile
            label="vs last month"
            value={formatCurrency(trend[trend.length - 1]!.value, 'USD')}
            icon={Target}
            trend={{ value: '+12%', direction: 'up' }}
            tint={colors.warning}
          />
        </View>

        <Section title="Spending by Category">
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
              centerValue={formatCurrency(monthTotal, 'USD')}
              centerLabel="total"
            />
          </View>
        </Section>

        <Section title="6-Month Trend">
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
            <BarChart data={trend} />
          </View>
        </Section>

        <Section title="Budget & Goals">
          <View style={{ marginHorizontal: spacing.md, gap: spacing.sm }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>Monthly budget</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {formatCurrency(monthTotal, 'USD')} / {formatCurrency(MONTHLY_BUDGET, 'USD')}
                </Text>
              </View>
              <ProgressBar
                ratio={budgetRatio}
                color={budgetRatio > 0.9 ? colors.danger : colors.primary}
              />
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <PiggyBank size={16} color={colors.success} strokeWidth={1.75} />
                <Text style={[typography.bodyMedium, { color: colors.text }]}>Savings goal</Text>
              </View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {formatCurrency(SAVINGS_CURRENT, 'USD')} of {formatCurrency(SAVINGS_GOAL, 'USD')}
              </Text>
              <ProgressBar ratio={savingsRatio} color={colors.success} />
            </View>
          </View>
        </Section>

        <Section title="Recent Transactions">
          <View style={{ marginHorizontal: spacing.md, gap: spacing.sm }}>
            {transactions.map((tx) => (
              <View
                key={tx.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.button,
                    backgroundColor: `${categoryColors[tx.color]}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Receipt size={16} color={categoryColors[tx.color]} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Tag label={tx.category} color={categoryColors[tx.color]} />
                </View>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>
                  -{formatCurrency(tx.amount, 'USD')}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={{ position: 'absolute', right: spacing.md, bottom: insets.bottom + 100 }}>
        <FloatingButton
          icon={Plus}
          accessibilityLabel="Add expense"
          onPress={() => router.push('/create/expense')}
        />
      </View>
    </View>
  );
}
