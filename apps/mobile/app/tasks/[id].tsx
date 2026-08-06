import { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateTaskSchema,
  priorityEnum,
  recurrenceFreqEnum,
  type UpdateTaskInput,
  type Priority,
  type RecurrenceFreq,
} from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  IconButton,
  LoadingState,
  ErrorState,
  TextInput,
} from '@/components';
import { tasksApi } from '@/features/tasks/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import {
  DUE_DATE_OPTIONS,
  dueDateOptionToIso,
  isoToDueDateOption,
  formatDueDate,
  dueDateTone,
  type DueDateOptionId,
} from '@/features/tasks/due-date';

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_TONE: Record<Priority, 'neutral' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  MEDIUM: 'neutral',
  HIGH: 'warning',
  URGENT: 'danger',
};

const RECURRENCE_LABELS: Record<RecurrenceFreq, string> = {
  NONE: 'None',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography } = useTheme();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [newSubtask, setNewSubtask] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: '',
      notes: '',
      category: '',
      priority: 'MEDIUM' as const,
      recurrence: 'NONE' as const,
      dueDate: undefined as string | undefined,
    },
  });
  const [dueOption, setDueOption] = useState<DueDateOptionId | 'custom'>('none');

  const selectDueOption = (optionId: DueDateOptionId) => {
    setDueOption(optionId);
    setValue('dueDate', dueDateOptionToIso(optionId));
  };

  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });
  const invalidateDetail = () =>
    queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', id] });

  const reportError = (err: unknown) =>
    showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');

  const startEdit = () => {
    if (!task) return;
    reset({
      title: task.title,
      notes: task.notes ?? '',
      category: task.category ?? '',
      priority: task.priority,
      recurrence: task.recurrence,
      dueDate: task.dueDate ?? undefined,
    });
    setDueOption(isoToDueDateOption(task.dueDate));
    setMode('edit');
  };

  const onSave = async (input: UpdateTaskInput) => {
    if (!id) return;
    setSaveError(null);
    setSaving(true);
    try {
      await tasksApi.update(id, {
        ...input,
        notes: input.notes || undefined,
        category: input.category || undefined,
      });
      await invalidateAll();
      showToast('Task updated', 'success');
      setMode('view');
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!id || !task) return;
    try {
      if (task.status === 'COMPLETED') {
        await tasksApi.reopen(id);
        await invalidateAll();
        showToast('Task reopened', 'success');
      } else {
        await tasksApi.complete(id);
        await invalidateAll();
        showToast('Task completed', 'success');
      }
    } catch (err) {
      reportError(err);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete task', 'This task will be moved to trash.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await tasksApi.delete(id);
            await invalidateAll();
            showToast('Task deleted', 'success', {
              label: 'Undo',
              onPress: async () => {
                try {
                  await tasksApi.restore(id);
                  await invalidateAll();
                } catch (err) {
                  reportError(err);
                }
              },
            });
            router.back();
          } catch (err) {
            reportError(err);
          }
        },
      },
    ]);
  };

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await tasksApi.updateSubtask(subtaskId, { completed: !completed });
      await invalidateDetail();
    } catch (err) {
      reportError(err);
    }
  };

  const removeSubtask = async (subtaskId: string) => {
    try {
      await tasksApi.deleteSubtask(subtaskId);
      await invalidateDetail();
    } catch (err) {
      reportError(err);
    }
  };

  const addSubtask = async () => {
    if (!id || !newSubtask.trim()) return;
    try {
      await tasksApi.createSubtask(id, { title: newSubtask.trim() });
      setNewSubtask('');
      await invalidateDetail();
    } catch (err) {
      reportError(err);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Task' }} />
        <LoadingState />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Task' }} />
        <ErrorState description="Couldn't load this task." onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: mode === 'edit' ? 'Edit Task' : 'Task' }} />

      {mode === 'view' ? (
        <>
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
              <Badge
                label={task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                tone={task.status === 'COMPLETED' ? 'success' : 'neutral'}
              />
              <Badge label={PRIORITY_LABELS[task.priority]} tone={PRIORITY_TONE[task.priority]} />
              {task.category ? <Badge label={task.category} tone="info" /> : null}
              {formatDueDate(task.dueDate) ? (
                <Badge
                  label={formatDueDate(task.dueDate)!}
                  tone={dueDateTone(task.dueDate, task.status)}
                />
              ) : null}
              {task.recurrence !== 'NONE' ? (
                <Badge label={`Repeats ${RECURRENCE_LABELS[task.recurrence].toLowerCase()}`} />
              ) : null}
            </View>
            <Text style={[typography.screenTitle, { color: colors.text }]}>{task.title}</Text>
            {task.notes ? (
              <Text style={[typography.body, { color: colors.textSecondary }]}>{task.notes}</Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Button label="Edit" variant="secondary" onPress={startEdit} />
            <Button
              label={task.status === 'COMPLETED' ? 'Reopen' : 'Mark complete'}
              onPress={handleToggleComplete}
            />
            <Button label="Delete" variant="danger" onPress={handleDelete} />
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Subtasks</Text>
            {(task.subtasks ?? []).map((subtask) => (
              <View
                key={subtask.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <Checkbox
                  checked={subtask.completed}
                  onToggle={() => toggleSubtask(subtask.id, subtask.completed)}
                  color={colors.success}
                  size={20}
                  accessibilityLabel={
                    subtask.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleSubtask(subtask.id, subtask.completed)}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: subtask.completed ? colors.textTertiary : colors.text,
                        textDecorationLine: subtask.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {subtask.title}
                  </Text>
                </Pressable>
                <IconButton
                  icon={X}
                  accessibilityLabel="Remove subtask"
                  onPress={() => removeSubtask(subtask.id)}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                  placeholder="Add a subtask"
                  onSubmitEditing={addSubtask}
                  returnKeyType="done"
                />
              </View>
              <IconButton
                icon={Plus}
                accessibilityLabel="Add subtask"
                variant="filled"
                onPress={addSubtask}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          {saveError ? (
            <View style={{ backgroundColor: colors.danger, borderRadius: 10, padding: spacing.sm }}>
              <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{saveError}</Text>
            </View>
          ) : null}

          <View style={{ gap: spacing.md }}>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextInput
                  label="Title"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.title?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <TextInput
                  label="Notes (optional)"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.notes?.message}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <TextInput
                  label="Category (optional)"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.category?.message}
                />
              )}
            />
            <View style={{ gap: spacing.xxs }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Priority</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                    {priorityEnum.options.map((priority) => (
                      <Chip
                        key={priority}
                        label={PRIORITY_LABELS[priority]}
                        selected={field.value === priority}
                        onPress={() => field.onChange(priority)}
                      />
                    ))}
                  </View>
                )}
              />
            </View>

            <View style={{ gap: spacing.xxs }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Due date</Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                {DUE_DATE_OPTIONS.map((option) => (
                  <Chip
                    key={option.id}
                    label={option.label}
                    selected={dueOption === option.id}
                    onPress={() => selectDueOption(option.id)}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.xxs }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Repeat</Text>
              <Controller
                control={control}
                name="recurrence"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                    {recurrenceFreqEnum.options.map((freq) => (
                      <Chip
                        key={freq}
                        label={RECURRENCE_LABELS[freq]}
                        selected={field.value === freq}
                        onPress={() => field.onChange(freq)}
                      />
                    ))}
                  </View>
                )}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Cancel" variant="secondary" onPress={() => setMode('view')} />
            <Button label="Save" onPress={handleSubmit(onSave)} loading={saving} />
          </View>
        </>
      )}
    </ScrollView>
  );
}
