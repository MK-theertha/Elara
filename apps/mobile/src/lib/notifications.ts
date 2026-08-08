import { Platform } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';

/** expo-notifications' Android remote-push machinery was removed from Expo Go in SDK 53 —
 * merely calling `setNotificationHandler`/`setNotificationChannelAsync` there throws
 * synchronously. Everything in this module is guarded behind this check so the app runs
 * fine in Expo Go (reminders just silently don't schedule); a real dev/production build
 * gets full local-notification support. */
export function isExpoGo(): boolean {
  return Constants.appOwnership === AppOwnership.Expo;
}

let configured = false;

async function ensureConfigured(): Promise<typeof import('expo-notifications') | null> {
  if (isExpoGo()) return null;
  const Notifications = await import('expo-notifications');
  if (!configured) {
    configured = true;
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    } catch {
      // Best-effort setup — scheduling calls below still no-op safely if this failed.
    }
  }
  return Notifications;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await ensureConfigured();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

function taskReminderId(taskId: string): string {
  return `task-reminder-${taskId}`;
}

/** Schedules a local notification at a task's due date. Cancels any existing reminder for
 * the same task first, so editing a due date reschedules rather than stacking reminders. */
export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDateIso: string,
): Promise<void> {
  await cancelTaskReminder(taskId);
  const dueDate = new Date(dueDateIso);
  if (dueDate.getTime() <= Date.now()) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const Notifications = await ensureConfigured();
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: taskReminderId(taskId),
      content: {
        title: 'Task due',
        body: title,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : null),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueDate },
    });
  } catch {
    // Reminder just doesn't get scheduled — never worth crashing the task save over.
  }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  const Notifications = await ensureConfigured();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(taskReminderId(taskId)).catch(() => {});
}

const DAILY_SUMMARY_ID = 'daily-summary';

/** Repeating local notification at a fixed time — the content is necessarily generic
 * (expo-notifications triggers can't compute fresh copy at delivery time without a
 * push-capable backend), which is the honest limit of what this can do without a server. */
export async function enableDailySummary(): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  if (!granted) return false;

  const Notifications = await ensureConfigured();
  if (!Notifications) return false;

  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_SUMMARY_ID,
      content: {
        title: 'Your day, at a glance',
        body: "Open Elara to see today's tasks, events, and reminders.",
        ...(Platform.OS === 'android' ? { channelId: 'default' } : null),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function disableDailySummary(): Promise<void> {
  const Notifications = await ensureConfigured();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID).catch(() => {});
}
