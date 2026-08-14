import { memo, useCallback, useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Check, ListTodo, Plus, Trash2 } from 'lucide-react-native';
import type { TaskDto } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import {
  Chip,
  EmptyState,
  ErrorState,
  FloatingButton,
  ProgressRing,
  ScreenHeader,
  SegmentedControl,
  SkeletonCard,
  SwipeableRow,
} from '@/components';
import { TaskCard } from '@/components/cards';
import { tasksApi } from '@/features/tasks/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import {
  PRIORITY_ORDER,
  priorityColor,
  priorityLabel,
  type TaskPriority,
} from '@/features/tasks/priority';
import { formatDueDate } from '@/features/tasks/due-date';

const FILTERS = ['Today', 'Upcoming', 'Completed', 'All'] as const;
type TaskFilter = (typeof FILTERS)[number];

type TaskLayout = 'list' | 'kanban' | 'timeline';

const LAYOUTS: { label: string; value: TaskLayout }[] = [
  { label: 'List', value: 'list' },
  { label: 'Kanban', value: 'kanban' },
  { label: 'Timeline', value: 'timeline' },
];

function daysUntil(iso: string): number {
  const diffMs = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / 86_400_000);
}

function timelineBucket(task: TaskDto): string {
  if (!task.dueDate) return 'No due date';
  const days = daysUntil(task.dueDate);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return 'This week';
  return 'Later';
}

const TIMELINE_ORDER = ['Overdue', 'Today', 'Tomorrow', 'This week', 'Later', 'No due date'];

const TaskRow = memo(function TaskRow({
  task,
  onToggleComplete,
  onDelete,
}: {
  task: TaskDto;
  onToggleComplete: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
}) {
  const { colors } = useTheme();
  const handlePress = useCallback(() => router.push(`/tasks/${task.id}`), [task.id]);
  const handleToggle = useCallback(() => onToggleComplete(task), [task, onToggleComplete]);
  const handleDeleteTrigger = useCallback(() => onDelete(task), [task, onDelete]);

  return (
    <SwipeableRow
      leftAction={{ icon: Check, color: colors.success, onTrigger: handleToggle }}
      rightAction={{ icon: Trash2, color: colors.danger, onTrigger: handleDeleteTrigger }}
    >
      <TaskCard task={task} onPress={handlePress} onToggleComplete={handleToggle} />
    </SwipeableRow>
  );
});

export default function TasksScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<TaskFilter>('Today');
  const [layout, setLayout] = useState<TaskLayout>('list');
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => tasksApi.list({ view: filter.toLowerCase() as Lowercase<TaskFilter> }),
  });

  const categories = useMemo(
    () => Array.from(new Set((data ?? []).map((t) => t.category).filter((c): c is string => !!c))),
    [data],
  );
  const filtered = useMemo(
    () => (category ? (data ?? []).filter((t) => t.category === category) : (data ?? [])),
    [data, category],
  );

  const todayCompletion = useMemo(() => {
    if (filter !== 'Today' || !data || data.length === 0) return null;
    const done = data.filter((t) => t.status === 'COMPLETED').length;
    return { done, total: data.length, ratio: done / data.length };
  }, [filter, data]);

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    [queryClient],
  );
  const reportError = useCallback(
    (err: unknown) =>
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger'),
    [showToast],
  );

  const handleToggleComplete = useCallback(
    async (task: TaskDto) => {
      try {
        if (task.status === 'COMPLETED') await tasksApi.reopen(task.id);
        else await tasksApi.complete(task.id);
        await invalidate();
      } catch (err) {
        reportError(err);
      }
    },
    [invalidate, reportError],
  );

  const handleDelete = useCallback(
    async (task: TaskDto) => {
      try {
        await tasksApi.delete(task.id);
        await invalidate();
        showToast('Task deleted', 'success', {
          label: 'Undo',
          onPress: async () => {
            try {
              await tasksApi.restore(task.id);
              await invalidate();
            } catch (err) {
              reportError(err);
            }
          },
        });
      } catch (err) {
        reportError(err);
      }
    },
    [invalidate, reportError, showToast],
  );

  const emptyState = (
    <EmptyState
      icon={ListTodo}
      title={`No ${filter.toLowerCase()} tasks`}
      description="Tap the + button to create your first task."
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader
        title="Tasks"
        accessory={
          todayCompletion ? (
            <ProgressRing
              progress={todayCompletion.ratio}
              size={44}
              strokeWidth={5}
              showPercentage={false}
              label={`${todayCompletion.done}/${todayCompletion.total}`}
            />
          ) : undefined
        }
      />

      <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        <SegmentedControl options={LAYOUTS} value={layout} onChange={setLayout} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs }}
        >
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            <Chip
              label="All categories"
              selected={category === null}
              onPress={() => setCategory(null)}
            />
            {categories.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <ErrorState description="Couldn't load your tasks." onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        emptyState
      ) : layout === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={(task) => task.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          contentContainerStyle={{
            padding: spacing.md,
            gap: spacing.sm,
            paddingBottom: insets.bottom + 140,
          }}
          renderItem={({ item }) => (
            <TaskRow task={item} onToggleComplete={handleToggleComplete} onDelete={handleDelete} />
          )}
        />
      ) : layout === 'kanban' ? (
        <KanbanBoard
          tasks={filtered}
          onPressTask={(id) => router.push(`/tasks/${id}`)}
          bottomInset={insets.bottom}
        />
      ) : (
        <TimelineView
          tasks={filtered}
          onPressTask={(id) => router.push(`/tasks/${id}`)}
          bottomInset={insets.bottom}
        />
      )}

      <View style={{ position: 'absolute', right: spacing.md, bottom: insets.bottom + 100 }}>
        <FloatingButton
          icon={Plus}
          accessibilityLabel="New task"
          onPress={() => router.push('/create/task')}
        />
      </View>
    </View>
  );
}

function KanbanBoard({
  tasks,
  onPressTask,
  bottomInset,
}: {
  tasks: TaskDto[];
  onPressTask: (id: string) => void;
  bottomInset: number;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const columns: {
    key: TaskPriority | 'COMPLETED';
    label: string;
    color: string;
    tasks: TaskDto[];
  }[] = [
    ...PRIORITY_ORDER.map((p) => ({
      key: p,
      label: priorityLabel(p),
      color: priorityColor(p, colors),
      tasks: tasks.filter((t) => t.status === 'PENDING' && t.priority === p),
    })),
    {
      key: 'COMPLETED' as const,
      label: 'Completed',
      color: colors.success,
      tasks: tasks.filter((t) => t.status === 'COMPLETED'),
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        padding: spacing.md,
        gap: spacing.sm,
        paddingBottom: bottomInset + 140,
      }}
    >
      {columns.map((col) => (
        <View
          key={col.key}
          style={{
            width: 240,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: radius.card,
            padding: spacing.sm,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col.color }} />
            <Text style={[typography.caption, { color: colors.text }]}>{col.label}</Text>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              {col.tasks.length}
            </Text>
          </View>
          <View style={{ gap: spacing.xs }}>
            {col.tasks.map((task) => (
              <TaskCard key={task.id} task={task} onPress={() => onPressTask(task.id)} />
            ))}
            {col.tasks.length === 0 ? (
              <Text
                style={[typography.caption, { color: colors.textTertiary, padding: spacing.xs }]}
              >
                Nothing here
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function TimelineView({
  tasks,
  onPressTask,
  bottomInset,
}: {
  tasks: TaskDto[];
  onPressTask: (id: string) => void;
  bottomInset: number;
}) {
  const { colors, spacing, typography } = useTheme();
  const grouped = TIMELINE_ORDER.map((bucket) => ({
    bucket,
    tasks: tasks.filter((t) => timelineBucket(t) === bucket),
  })).filter((g) => g.tasks.length > 0);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.md,
        gap: spacing.lg,
        paddingBottom: bottomInset + 140,
      }}
    >
      {grouped.map((group) => (
        <View key={group.bucket} style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>{group.bucket}</Text>
          <View style={{ gap: spacing.sm }}>
            {group.tasks.map((task) => (
              <View
                key={task.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <Text style={[typography.caption, { color: colors.textTertiary, width: 60 }]}>
                  {formatDueDate(task.dueDate) ?? ''}
                </Text>
                <View style={{ flex: 1 }}>
                  <TaskCard task={task} onPress={() => onPressTask(task.id)} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
