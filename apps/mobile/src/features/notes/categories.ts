export { categoryToColorKey } from '@/lib/category-color';

/** Common note categories offered in the create-note picker. Backed by the
 * free-text `category` field on Note, not a stored enum — any string is valid. */
export const NOTE_CATEGORIES = ['Personal', 'Work', 'Ideas', 'Other'];

/** Notes have no dedicated "favorite" field — modeled as a well-known tag so it
 * persists through the same `tags` array the schema already provides. */
const FAVORITE_TAG = 'favorite';

export function isFavorite(tags: string[]): boolean {
  return tags.includes(FAVORITE_TAG);
}

export function toggleFavoriteTag(tags: string[]): string[] {
  return isFavorite(tags) ? tags.filter((t) => t !== FAVORITE_TAG) : [...tags, FAVORITE_TAG];
}
