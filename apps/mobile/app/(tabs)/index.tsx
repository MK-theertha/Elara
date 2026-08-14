import { memo, useCallback, useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import {
  CalendarClock,
  ChevronRight,
  GripVertical,
  Receipt,
  Sparkles,
  StickyNote,
  Wallet,
} from 'lucide-react-native';
import { formatCurrency } from '@elara/shared';
import type { TaskDto } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { categoryColors } from '@/theme/colors';
import { getGreeting } from '@/lib/greeting';
import {
  getExpenseCategories,
  getQuoteOfTheDay,
  getSampleNotes,
  getSampleShoppingLists,
  getTodaysEvents,
} from '@/lib/mock-data';
import {
  Avatar,
  AnimatedPressable,
  EmptyState,
  GradientBackground,
  StatTile,
  Tag,
} from '@/components';
import { TaskCard } from '@/components/cards';
import { useAuthStore } from '@/stores/auth-store';
import { useHomeLayoutStore, type HomeWidgetKey } from '@/stores/home-layout-store';
import { usePreferencesStore } from '@/stores/preferences-store';
import { tasksApi } from '@/features/tasks/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import { formatTimeInZone } from '@/lib/format-datetime';

function WidgetHeader({
  title,
  actionLabel,
  onActionPress,
  drag,
  isActive,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  drag: () => void;
  isActive: boolean;
}) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        delayLongPress={220}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        accessibilityRole="button"
        accessibilityLabel={`${title}. Hold to reorder.`}
      >
        <GripVertical size={13} color={colors.textTertiary} strokeWidth={1.75} />
        <Text style={[typography.cardTitle, { color: colors.text }]}>{title}</Text>
      </Pressable>
      {actionLabel && onActionPress ? (
        <AnimatedPressable
          accessibilityRole="button"
          onPress={onActionPress}
          scaleTo={0.94}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <Text style={[typography.caption, { color: colors.primary }]}>{actionLabel}</Text>
          <ChevronRight size={14} color={colors.primary} strokeWidth={2} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const HomeTaskRow = memo(function HomeTaskRow({
  task,
  onToggleComplete,
}: {
  task: TaskDto;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}) {
  const handlePress = useCallback(() => router.push(`/tasks/${task.id}`), [task.id]);
  const handleToggle = useCallback(
    () => onToggleComplete(task.id, task.status === 'COMPLETED'),
    [task.id, task.status, onToggleComplete],
  );
  return <TaskCard task={task} onPress={handlePress} onToggleComplete={handleToggle} />;
});

export default function HomeScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0];
  const currency = usePreferencesStore((s) => s.currency);
  const timezone = usePreferencesStore((s) => s.timezone);

  const order = useHomeLayoutStore((s) => s.order);
  const setOrder = useHomeLayoutStore((s) => s.setOrder);
  const hydrateLayout = useHomeLayoutStore((s) => s.hydrate);
  useEffect(() => {
    hydrateLayout();
  }, [hydrateLayout]);

  const { data: todayTasks } = useQuery({
    queryKey: ['tasks', 'Today'],
    queryFn: () => tasksApi.list({ view: 'today' }),
  });
  const { data: completedTasks } = useQuery({
    queryKey: ['tasks', 'Completed'],
    queryFn: () => tasksApi.list({ view: 'completed' }),
  });

  const handleToggleComplete = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        if (completed) await tasksApi.reopen(taskId);
        else await tasksApi.complete(taskId);
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
      }
    },
    [queryClient, showToast],
  );

  const todaysEvents = useMemo(() => getTodaysEvents(), []);
  const expenseCategories = useMemo(() => getExpenseCategories(), []);
  const monthTotal = useMemo(
    () => expenseCategories.reduce((sum, c) => sum + c.amount, 0),
    [expenseCategories],
  );
  const topCategories = useMemo(
    () => [...expenseCategories].sort((a, b) => b.amount - a.amount).slice(0, 3),
    [expenseCategories],
  );
  const shoppingList = useMemo(() => getSampleShoppingLists()[0]!, []);
  const remainingItems = useMemo(
    () => shoppingList.items.filter((i) => !i.purchased),
    [shoppingList],
  );
  const notes = useMemo(
    () =>
      getSampleNotes()
        .filter((n) => n.pinned)
        .slice(0, 2),
    [],
  );

  const renderWidget = (key: HomeWidgetKey, drag: () => void, isActive: boolean) => {
    switch (key) {
      case 'tasks':
        return (
          <View
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            <WidgetHeader
              title="Upcoming Tasks"
              actionLabel="See all"
              onActionPress={() => router.push('/(tabs)/tasks')}
              drag={drag}
              isActive={isActive}
            />
            {todayTasks && todayTasks.length > 0 ? (
              <View style={{ gap: spacing.xs }}>
                {todayTasks.slice(0, 3).map((task) => (
                  <HomeTaskRow key={task.id} task={task} onToggleComplete={handleToggleComplete} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nothing due today"
                description="Enjoy the calm — or get ahead on tomorrow."
              />
            )}
          </View>
        );

      case 'schedule':
        return (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <WidgetHeader
              title="Today's Schedule"
              actionLabel="Calendar"
              onActionPress={() => router.push('/(tabs)/calendar')}
              drag={drag}
              isActive={isActive}
            />
            {todaysEvents.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                {todaysEvents.map((event) => (
                  <View
                    key={event.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                  >
                    <Text style={[typography.caption, { color: colors.textSecondary, width: 56 }]}>
                      {formatTimeInZone(event.start, timezone)}
                    </Text>
                    <View
                      style={{
                        width: 3,
                        height: 28,
                        borderRadius: 2,
                        backgroundColor: categoryColors[event.color],
                      }}
                    />
                    <Text
                      style={[typography.body, { color: colors.text, flex: 1 }]}
                      numberOfLines={1}
                    >
                      {event.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nothing scheduled"
                description="Your day is wide open."
              />
            )}
          </View>
        );

      case 'expenses':
        return (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <WidgetHeader
              title="Expense Summary"
              actionLabel="Details"
              onActionPress={() => router.push('/(tabs)/expenses')}
              drag={drag}
              isActive={isActive}
            />
            <Text style={[typography.screenTitle, { color: colors.text }]}>
              {formatCurrency(monthTotal, currency)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              spent this month
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxs }}>
              {topCategories.map((c) => (
                <View key={c.key} style={{ flex: 1, gap: 4 }}>
                  <Tag label={c.label.split(' ')[0]!} color={categoryColors[c.color]} />
                  <Text style={[typography.caption, { color: colors.text }]}>
                    {formatCurrency(c.amount, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'shopping':
        return (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <WidgetHeader
              title="Shopping Reminder"
              actionLabel="Lists"
              onActionPress={() => router.push('/(tabs)/more/shopping')}
              drag={drag}
              isActive={isActive}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.button,
                  backgroundColor: `${colors.success}1A`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={19} color={colors.success} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>
                  {shoppingList.name}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {remainingItems.length} items left · {shoppingList.store}
                </Text>
              </View>
            </View>
          </View>
        );

      case 'notes':
        return (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <WidgetHeader
              title="Recent Notes"
              actionLabel="All notes"
              onActionPress={() => router.push('/(tabs)/more/notes')}
              drag={drag}
              isActive={isActive}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {notes.map((note) => (
                <View
                  key={note.id}
                  style={{
                    flex: 1,
                    backgroundColor: `${categoryColors[note.color]}12`,
                    borderRadius: radius.button,
                    padding: spacing.sm,
                    gap: 4,
                  }}
                >
                  <StickyNote size={14} color={categoryColors[note.color]} strokeWidth={1.75} />
                  <Text style={[typography.caption, { color: colors.text }]} numberOfLines={2}>
                    {note.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'ai':
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/ai')}
            style={{ borderRadius: radius.card, overflow: 'hidden' }}
          >
            <GradientBackground style={{ padding: spacing.md, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="#FFFFFF" strokeWidth={1.75} />
                  <Text style={[typography.caption, { color: 'rgba(255,255,255,0.85)' }]}>
                    COMING SOON
                  </Text>
                </View>
                <Pressable onLongPress={drag} disabled={isActive} hitSlop={8}>
                  <GripVertical size={14} color="rgba(255,255,255,0.6)" strokeWidth={1.75} />
                </Pressable>
              </View>
              <Text style={[typography.cardTitle, { color: '#FFFFFF' }]}>
                Meet your AI Assistant
              </Text>
              <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.85)' }]}>
                Ask questions, plan your day, and get smart suggestions — arriving soon.
              </Text>
            </GradientBackground>
          </Pressable>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DraggableFlatList
        data={order}
        keyExtractor={(key) => key}
        onDragEnd={({ data }) => setOrder(data)}
        activationDistance={12}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + 140,
          paddingHorizontal: spacing.md,
          gap: spacing.md,
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ gap: 2 }}>
                <Text style={[typography.displayLarge, { color: colors.text }]}>
                  {getGreeting()}
                  {firstName ? `, ${firstName}` : ''}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                onPress={() => router.push('/(tabs)/more/profile')}
              >
                <Avatar name={user?.name ?? 'You'} size={48} ring />
              </Pressable>
            </View>

            <View
              style={[
                {
                  backgroundColor: `${colors.primary}0F`,
                  borderRadius: radius.button,
                  padding: spacing.sm + 2,
                },
              ]}
            >
              <Text style={[typography.bodySmall, { color: colors.text, fontStyle: 'italic' }]}>
                “{getQuoteOfTheDay()}”
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <StatTile
                label="Today's Tasks"
                value={todayTasks?.length ?? 0}
                icon={CalendarClock}
              />
              <StatTile
                label="Completed"
                value={completedTasks?.length ?? 0}
                tint={colors.success}
                icon={Receipt}
              />
              <StatTile
                label="This Month"
                value={formatCurrency(monthTotal, currency)}
                tint={colors.warning}
                icon={Wallet}
              />
              <StatTile
                label="Upcoming Events"
                value={todaysEvents.length}
                tint={colors.info}
                icon={CalendarClock}
              />
            </View>
          </View>
        }
        renderItem={({ item, drag, isActive }: RenderItemParams<HomeWidgetKey>) => (
          <View
            style={{ opacity: isActive ? 0.9 : 1, transform: [{ scale: isActive ? 1.02 : 1 }] }}
          >
            {renderWidget(item, drag, isActive)}
          </View>
        )}
      />
    </View>
  );
}
