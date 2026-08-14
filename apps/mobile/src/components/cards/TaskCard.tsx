import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TaskDto } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { formatDueDate, dueDateTone } from '@/features/tasks/due-date';
import { priorityColor } from '@/features/tasks/priority';
import { Checkbox } from '../Checkbox';
import { Tag } from '../Chip';
import { AnimatedPressable } from '../AnimatedPressable';

export interface TaskCardProps {
  task: TaskDto;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export const TaskCard = memo(function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const completed = task.status === 'COMPLETED';
  const accent = priorityColor(task.priority, colors);
  const dueLabel = formatDueDate(task.dueDate);
  const tone = dueDateTone(task.dueDate, task.status);
  const subtaskTotal = task.subtasks?.length ?? 0;
  const subtaskDone = task.subtasks?.filter((s) => s.completed).length ?? 0;

  const dueColor =
    tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.textSecondary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 3,
        borderLeftColor: accent,
        padding: spacing.sm + 2,
      }}
    >
      {onToggleComplete ? (
        <Checkbox
          checked={completed}
          onToggle={onToggleComplete}
          color={colors.success}
          accessibilityLabel={completed ? 'Mark incomplete' : 'Mark complete'}
        />
      ) : null}
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={[
            typography.bodyMedium,
            {
              color: completed ? colors.textTertiary : colors.text,
              textDecorationLine: completed ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {dueLabel ? (
            <Text style={[typography.caption, { color: dueColor }]}>{dueLabel}</Text>
          ) : null}
          {task.category ? <Tag label={task.category} color={accent} /> : null}
          {subtaskTotal > 0 ? (
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              {subtaskDone}/{subtaskTotal}
            </Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
});
