export function isOverdue(dueDate: string | null, referenceDate: Date = new Date()): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < referenceDate.getTime();
}

export function isToday(dateIso: string, referenceDate: Date = new Date()): boolean {
  const date = new Date(dateIso);
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  );
}

export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function startOfWeek(date: Date = new Date()): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
}

export function startOfMonth(date: Date = new Date()): Date {
  const result = startOfDay(date);
  result.setDate(1);
  return result;
}
