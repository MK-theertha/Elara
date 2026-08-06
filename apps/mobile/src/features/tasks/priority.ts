import type { ThemeColors } from '@/theme/colors';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const PRIORITY_ORDER: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export function priorityColor(priority: TaskPriority, colors: ThemeColors): string {
  switch (priority) {
    case 'URGENT':
      return colors.danger;
    case 'HIGH':
      return colors.warning;
    case 'MEDIUM':
      return colors.info;
    case 'LOW':
    default:
      return colors.textTertiary;
  }
}

export function priorityLabel(priority: TaskPriority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}
