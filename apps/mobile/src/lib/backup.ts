import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useNotesStore } from '@/stores/notes-store';
import { useShoppingStore } from '@/stores/shopping-store';
import { usePreferencesStore } from '@/stores/preferences-store';

/** Exports everything Elara stores locally (notes, shopping lists, preferences — there's no
 * task/calendar/expense backup here since those already live on the API server once synced)
 * to a JSON file and hands it to the OS share sheet. Purely local; no network involved. */
export async function exportLocalBackup(): Promise<void> {
  const payload = {
    exportedAt: new Date().toISOString(),
    notes: useNotesStore.getState().notes,
    shoppingLists: useShoppingStore.getState().lists,
    preferences: {
      language: usePreferencesStore.getState().language,
      timezone: usePreferencesStore.getState().timezone,
      currency: usePreferencesStore.getState().currency,
    },
  };

  const file = new File(Paths.cache, `elara-backup-${Date.now()}.json`);
  file.write(JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Elara backup',
    });
  }
}

export function getLocalDataCounts(): {
  notes: number;
  shoppingLists: number;
  shoppingItems: number;
} {
  const notes = useNotesStore.getState().notes.length;
  const lists = useShoppingStore.getState().lists;
  const shoppingItems = lists.reduce((sum, l) => sum + l.items.length, 0);
  return { notes, shoppingLists: lists.length, shoppingItems };
}

export function clearLocalData(): void {
  useNotesStore.setState({ notes: [] });
  useShoppingStore.setState({ lists: [] });
}

export function formatRelativeBackup(iso: string | null): string {
  if (!iso) return 'Last backup: never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'Last backup: just now';
  if (minutes < 60) return `Last backup: ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Last backup: ${hours}h ago`;
  const days = Math.round(hours / 24);
  return `Last backup: ${days}d ago`;
}
