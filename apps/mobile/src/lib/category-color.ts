import type { CategoryColorKey } from '@/theme/colors';

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

/** Several resources (events, notes) have no stored color — this deterministically
 * derives one from a free-text category string so the same category always renders
 * the same accent, without a hash collision table to maintain. */
export function categoryToColorKey(category: string | null | undefined): CategoryColorKey {
  if (!category) return 'indigo';
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return COLOR_KEYS[hash % COLOR_KEYS.length]!;
}

/** Deterministic pseudo-height for masonry-style card layouts, derived from an id
 * so layout stays stable across refetches without persisting a random value. */
export function hashedCardHeight(id: string, min = 120, range = 60): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return min + (hash % range);
}
