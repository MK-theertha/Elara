import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { getGreeting } from '@/lib/greeting';
import { Section, EmptyState, StatTile } from '@/components';

const QUICK_ACTIONS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/create/task' | '/create/note' | '/create/expense' | '/create/event';
}[] = [
  { label: 'Task', icon: 'checkbox-outline', route: '/create/task' },
  { label: 'Note', icon: 'document-text-outline', route: '/create/note' },
  { label: 'Expense', icon: 'cash-outline', route: '/create/expense' },
  { label: 'Event', icon: 'calendar-outline', route: '/create/event' },
];

export default function HomeScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: insets.bottom + spacing.xxxl,
        gap: spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.xxs }}>
        <Text style={[typography.displayLarge, { color: colors.text }]}>{getGreeting()} 👋</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Here&apos;s your day.
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        <StatTile label="Today's Tasks" value={0} />
        <StatTile label="Completed" value={0} />
        <StatTile label="Upcoming Events" value={0} />
        <StatTile label="Expenses" value={0} />
      </View>

      <View style={{ paddingHorizontal: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.route}
            accessibilityRole="button"
            accessibilityLabel={`Add ${action.label}`}
            onPress={() => router.push(action.route)}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: 'center',
                gap: spacing.xxs,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: colors.backgroundSecondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name={action.icon} size={20} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.text }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Section
        title="Today's Tasks"
        actionLabel="See all"
        onActionPress={() => router.push('/(tabs)/tasks')}
      >
        <View style={{ paddingHorizontal: spacing.md }}>
          <EmptyState
            icon="checkbox-outline"
            title="No tasks yet"
            description="Tasks you create will show up here."
          />
        </View>
      </Section>

      <Section
        title="Upcoming Events"
        actionLabel="See all"
        onActionPress={() => router.push('/(tabs)/calendar')}
      >
        <View style={{ paddingHorizontal: spacing.md }}>
          <EmptyState
            icon="calendar-outline"
            title="Nothing scheduled"
            description="Events and reminders will show up here."
          />
        </View>
      </Section>
    </ScrollView>
  );
}
