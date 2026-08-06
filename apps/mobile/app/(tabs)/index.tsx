import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/theme/useTheme';
import { getGreeting } from '@/lib/greeting';
import { Section, EmptyState, StatTile } from '@/components';
import { useAuthStore } from '@/stores/auth-store';
import { tasksApi } from '@/features/tasks/api';
import { formatDueDate } from '@/features/tasks/due-date';

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
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0];

  const { data: todayTasks } = useQuery({
    queryKey: ['tasks', 'Today'],
    queryFn: () => tasksApi.list({ view: 'today' }),
  });
  const { data: completedTasks } = useQuery({
    queryKey: ['tasks', 'Completed'],
    queryFn: () => tasksApi.list({ view: 'completed' }),
  });

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
        <Text style={[typography.displayLarge, { color: colors.text }]}>
          {getGreeting()}
          {firstName ? `, ${firstName}` : ''} 👋
        </Text>
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
        <StatTile label="Today's Tasks" value={todayTasks?.length ?? 0} />
        <StatTile label="Completed" value={completedTasks?.length ?? 0} />
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
        {todayTasks && todayTasks.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
            {todayTasks.slice(0, 5).map((task) => (
              <Pressable
                key={task.id}
                accessibilityRole="button"
                onPress={() => router.push(`/tasks/${task.id}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Ionicons
                  name={task.status === 'COMPLETED' ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={task.status === 'COMPLETED' ? colors.primary : colors.textSecondary}
                />
                <Text style={[typography.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {task.title}
                </Text>
                {formatDueDate(task.dueDate) ? (
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {formatDueDate(task.dueDate)}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.md }}>
            <EmptyState
              icon="checkbox-outline"
              title="No tasks yet"
              description="Tasks you create will show up here."
            />
          </View>
        )}
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
