import { View, FlatList, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { router } from 'expo-router';
import type { TaskDto } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import {
  Badge,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  ScreenHeader,
} from '@/components';
import { tasksApi } from '@/features/tasks/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import { formatDueDate, dueDateTone } from '@/features/tasks/due-date';

const VIEWS = ['Today', 'Upcoming', 'Completed', 'All'] as const;
type TaskView = (typeof VIEWS)[number];

const PRIORITY_TONE: Record<TaskDto['priority'], 'neutral' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'neutral',
  HIGH: 'warning',
  URGENT: 'danger',
};

export default function TasksScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [view, setView] = useState<TaskView>('Today');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['tasks', view],
    queryFn: () => tasksApi.list({ view: view.toLowerCase() as Lowercase<TaskView> }),
  });

  const handleToggleComplete = async (task: TaskDto) => {
    try {
      if (task.status === 'COMPLETED') {
        await tasksApi.reopen(task.id);
      } else {
        await tasksApi.complete(task.id);
      }
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Tasks" />
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        {VIEWS.map((v) => (
          <Chip key={v} label={v} selected={view === v} onPress={() => setView(v)} />
        ))}
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState description="Couldn't load your tasks." onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(task) => task.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={
            data && data.length > 0 ? undefined : { flexGrow: 1, justifyContent: 'center' }
          }
          ListEmptyComponent={
            <EmptyState
              icon="checkbox-outline"
              title={`No ${view.toLowerCase()} tasks`}
              description="Tap the + button to create your first task."
            />
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                minHeight: 56,
                gap: spacing.sm,
              }}
            >
              <IconButton
                name={item.status === 'COMPLETED' ? 'checkbox' : 'square-outline'}
                color={item.status === 'COMPLETED' ? colors.primary : colors.textSecondary}
                accessibilityLabel={
                  item.status === 'COMPLETED' ? 'Reopen task' : 'Mark task complete'
                }
                onPress={() => handleToggleComplete(item)}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/tasks/${item.id}`)}
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}
              >
                <Text
                  style={[
                    typography.body,
                    {
                      color: item.status === 'COMPLETED' ? colors.textTertiary : colors.text,
                      textDecorationLine: item.status === 'COMPLETED' ? 'line-through' : 'none',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.category ? (
                  <Text
                    style={[typography.bodySmall, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.category}
                  </Text>
                ) : null}
              </Pressable>
              {formatDueDate(item.dueDate) && item.status === 'PENDING' ? (
                <Badge
                  label={formatDueDate(item.dueDate)!}
                  tone={dueDateTone(item.dueDate, item.status)}
                />
              ) : null}
              {item.priority !== 'LOW' ? (
                <Badge label={item.priority} tone={PRIORITY_TONE[item.priority]} />
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}
