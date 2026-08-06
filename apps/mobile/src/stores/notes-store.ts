import { create } from 'zustand';
import { getSampleNotes, type MockNote } from '@/lib/mock-data';

let nextId = 1000;

interface NotesState {
  notes: MockNote[];
  addNote: (note: Pick<MockNote, 'title' | 'preview' | 'color' | 'folder'>) => string;
  updateNote: (
    id: string,
    patch: Partial<Pick<MockNote, 'title' | 'preview' | 'color' | 'folder'>>,
  ) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

/** Session-only store seeded from sample data — Notes has no backend yet, but the create/
 * edit/pin/favorite flows need to visibly do something rather than being dead ends. */
export const useNotesStore = create<NotesState>((set) => ({
  notes: getSampleNotes(),

  addNote: (note) => {
    const id = `note-${nextId++}`;
    set((state) => ({
      notes: [
        {
          ...note,
          id,
          pinned: false,
          favorite: false,
          updatedAt: new Date(),
          height: 120 + Math.round(Math.random() * 60),
        },
        ...state.notes,
      ],
    }));
    return id;
  },

  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date() } : n)),
    })),

  deleteNote: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

  togglePin: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n)),
    })),
}));
