import type { CategoryColorKey } from '@/theme/colors';

/** Common event categories offered in the create-event picker. Backed by the
 * free-text `category` field on Event, not a stored enum — any string is valid. */
export const EVENT_CATEGORIES = ['Work', 'Personal', 'Health', 'Social', 'Travel', 'Other'];

const COLOR_KEYS: CategoryColorKey[] = [
  'indigo',
  'violet',
  'green',
  'amber',
  'red',
  'blue',
  'pink',
  'teal',
];

/** Events have no stored color — this deterministically derives one from the
 * category string so the same category always renders the same accent. */
export function categoryToColorKey(category: string | null | undefined): CategoryColorKey {
  if (!category) return 'indigo';
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return COLOR_KEYS[hash % COLOR_KEYS.length]!;
}
