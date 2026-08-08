/** Formats a time respecting the user's timezone preference — 'Automatic' (or any value
 * Intl rejects) falls back to the device's own timezone rather than throwing. */
export function formatTimeInZone(date: Date, timezone: string): string {
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  if (timezone && timezone !== 'Automatic') {
    try {
      return date.toLocaleTimeString(undefined, { ...options, timeZone: timezone });
    } catch {
      // Fall through to device default below.
    }
  }
  return date.toLocaleTimeString(undefined, options);
}
