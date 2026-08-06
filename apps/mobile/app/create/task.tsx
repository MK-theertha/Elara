import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import {
  createTaskSchema,
  priorityEnum,
  recurrenceFreqEnum,
  type CreateTaskInput,
  type Priority,
  type RecurrenceFreq,
} from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, Chip, IconButton, TextInput } from '@/components';
import { tasksApi } from '@/features/tasks/api';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';
import {
  DUE_DATE_OPTIONS,
  dueDateOptionToIso,
  type DueDateOptionId,
} from '@/features/tasks/due-date';

const PRIORITIES = priorityEnum.options;

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const RECURRENCE_LABELS: Record<RecurrenceFreq, string> = {
  NONE: 'None',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export default function CreateTaskScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      notes: '',
      priority: 'MEDIUM' as const,
      category: '',
      recurrence: 'NONE' as const,
      dueDate: undefined as string | undefined,
      subtasks: [] as { title: string }[],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'subtasks' });
  const [dueOption, setDueOption] = useState<DueDateOptionId>('none');

  const selectDueOption = (id: DueDateOptionId) => {
    setDueOption(id);
    setValue('dueDate', dueDateOptionToIso(id));
  };

  const onSubmit = async (input: CreateTaskInput) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await tasksApi.create({
        ...input,
        notes: input.notes || undefined,
        category: input.category || undefined,
        subtasks: input.subtasks?.filter((subtask) => subtask.title.trim().length > 0),
      });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast('Task created', 'success');
      router.back();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'New Task' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {submitError ? (
          <View
            style={{
              backgroundColor: colors.danger,
              borderRadius: radius.button,
              padding: spacing.sm,
            }}
          >
            <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{submitError}</Text>
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
                autoFocus
                testID="task-title"
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
                  {PRIORITIES.map((priority) => (
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

          <View style={{ gap: spacing.xxs }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Subtasks</Text>
            {fields.map((field, index) => (
              <View
                key={field.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
              >
                <Controller
                  control={control}
                  name={`subtasks.${index}.title`}
                  render={({ field: subtaskField }) => (
                    <View style={{ flex: 1 }}>
                      <TextInput
                        value={subtaskField.value}
                        onChangeText={subtaskField.onChange}
                        onBlur={subtaskField.onBlur}
                        placeholder="Subtask title"
                      />
                    </View>
                  )}
                />
                <IconButton
                  icon={X}
                  accessibilityLabel="Remove subtask"
                  onPress={() => remove(index)}
                />
              </View>
            ))}
            <Button
              label="+ Add subtask"
              variant="ghost"
              size="sm"
              onPress={() => append({ title: '' })}
            />
          </View>
        </View>

        <Button
          label="Create Task"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
