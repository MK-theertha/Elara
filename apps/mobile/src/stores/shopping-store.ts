import { create } from 'zustand';
import { getSampleShoppingLists, type MockShoppingList } from '@/lib/mock-data';
import type { CategoryColorKey } from '@/theme/colors';

let nextListId = 1000;
let nextItemId = 1000;

interface ShoppingState {
  lists: MockShoppingList[];
  addList: (name: string, store: string, color: CategoryColorKey) => string;
  addItem: (listId: string, name: string, quantity: string, price: number) => void;
  togglePurchased: (listId: string, itemId: string) => void;
  removeItem: (listId: string, itemId: string) => void;
}

/** Session-only store seeded from sample data — Shopping Lists has no backend yet, but
 * checking items off and adding lists/items needs to visibly persist within the session. */
export const useShoppingStore = create<ShoppingState>((set) => ({
  lists: getSampleShoppingLists(),

  addList: (name, store, color) => {
    const id = `sl-${nextListId++}`;
    set((state) => ({ lists: [{ id, name, store, color, items: [] }, ...state.lists] }));
    return id;
  },

  addItem: (listId, name, quantity, price) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                { id: `item-${nextItemId++}`, name, quantity, price, purchased: false },
              ],
            }
          : list,
      ),
    })),

  togglePurchased: (listId, itemId) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, purchased: !item.purchased } : item,
              ),
            }
          : list,
      ),
    })),

  removeItem: (listId, itemId) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list,
      ),
    })),
}));
