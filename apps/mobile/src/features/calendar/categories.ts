export { categoryToColorKey } from '@/lib/category-color';

/** Common event categories offered in the create-event picker. Backed by the
 * free-text `category` field on Event, not a stored enum — any string is valid. */
export const EVENT_CATEGORIES = ['Work', 'Personal', 'Health', 'Social', 'Travel', 'Other'];
