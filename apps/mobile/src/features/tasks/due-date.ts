export const DUE_DATE_OPTIONS = [
  { id: 'none', label: 'No date' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'Next week' },
] as const;

export type DueDateOptionId = (typeof DUE_DATE_OPTIONS)[number]['id'];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function daysFromToday(iso: string): number {
  const diffMs = startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime();
  return Math.round(diffMs / 86_400_000);
}

/** Quick-select options resolve to end-of-day so they don't fall out of "today" as the day goes on. */
export function dueDateOptionToIso(id: DueDateOptionId): string | undefined {
  if (id === 'none') return undefined;
  const offset = id === 'today' ? 0 : id === 'tomorrow' ? 1 : 7;
  const date = addDays(new Date(), offset);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

/** Maps a stored ISO date back to a quick-select bucket, or 'custom' if it doesn't line up with one. */
export function isoToDueDateOption(iso: string | null | undefined): DueDateOptionId | 'custom' {
  if (!iso) return 'none';
  const diff = daysFromToday(iso);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === 7) return 'week';
  return 'custom';
}

export function formatDueDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const diff = daysFromToday(iso);
  const date = new Date(iso);
  const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff === -1) return 'Due yesterday';
  if (diff < 0) return `Overdue · ${formatted}`;
  return `Due ${formatted}`;
}

export function dueDateTone(
  iso: string | null | undefined,
  status: 'PENDING' | 'COMPLETED',
): 'neutral' | 'warning' | 'danger' {
  if (!iso || status === 'COMPLETED') return 'neutral';
  const diff = daysFromToday(iso);
  if (diff < 0) return 'danger';
  if (diff === 0) return 'warning';
  return 'neutral';
}
