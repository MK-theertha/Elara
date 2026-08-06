import type { CategoryColorKey } from '@/theme/colors';

/** Sample data for screens that don't have a backing API yet (Calendar, Expenses, Notes,
 * Shopping, Analytics) — matches the existing app's "stub screen with static content"
 * pattern, just richer. All dates are generated relative to "today" so the UI always looks
 * current. Swap for real API-backed hooks once those feature phases land. */

function atTime(daysFromToday: number, hours: number, minutes = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export interface MockEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: CategoryColorKey;
  location?: string;
}

export function getSampleEvents(): MockEvent[] {
  return [
    {
      id: 'ev-1',
      title: 'Design review',
      start: atTime(0, 9, 30),
      end: atTime(0, 10, 15),
      color: 'indigo',
      location: 'Zoom',
    },
    {
      id: 'ev-2',
      title: 'Lunch with Priya',
      start: atTime(0, 12, 30),
      end: atTime(0, 13, 30),
      color: 'amber',
      location: 'Cafe Lumen',
    },
    {
      id: 'ev-3',
      title: 'Dentist appointment',
      start: atTime(0, 17, 0),
      end: atTime(0, 17, 45),
      color: 'pink',
    },
    {
      id: 'ev-4',
      title: 'Sprint planning',
      start: atTime(1, 10, 0),
      end: atTime(1, 11, 0),
      color: 'indigo',
    },
    {
      id: 'ev-5',
      title: "Mom's birthday dinner",
      start: atTime(2, 19, 0),
      end: atTime(2, 21, 0),
      color: 'red',
    },
    {
      id: 'ev-6',
      title: 'Gym — leg day',
      start: atTime(1, 7, 0),
      end: atTime(1, 8, 0),
      color: 'green',
    },
    {
      id: 'ev-7',
      title: 'Flight to Austin',
      start: atTime(4, 6, 30),
      end: atTime(4, 9, 0),
      color: 'blue',
      location: 'Terminal 2',
    },
    {
      id: 'ev-8',
      title: 'Quarterly planning offsite',
      start: atTime(6, 9, 0),
      end: atTime(6, 16, 0),
      color: 'violet',
    },
    {
      id: 'ev-9',
      title: 'Book club',
      start: atTime(-2, 18, 30),
      end: atTime(-2, 20, 0),
      color: 'teal',
    },
  ];
}

export function getTodaysEvents(): MockEvent[] {
  const today = new Date();
  return getSampleEvents().filter((e) => e.start.toDateString() === today.toDateString());
}

export interface MockExpenseCategory {
  key: string;
  label: string;
  amount: number;
  color: CategoryColorKey;
}

export function getExpenseCategories(): MockExpenseCategory[] {
  return [
    { key: 'food', label: 'Food & Dining', amount: 412.5, color: 'amber' },
    { key: 'transport', label: 'Transport', amount: 168.2, color: 'blue' },
    { key: 'shopping', label: 'Shopping', amount: 289.75, color: 'violet' },
    { key: 'bills', label: 'Bills & Utilities', amount: 540.0, color: 'red' },
    { key: 'entertainment', label: 'Entertainment', amount: 96.4, color: 'pink' },
    { key: 'health', label: 'Health', amount: 74.0, color: 'green' },
  ];
}

export interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  color: CategoryColorKey;
  date: Date;
}

export function getRecentTransactions(): MockTransaction[] {
  return [
    {
      id: 'tx-1',
      description: 'Whole Foods Market',
      amount: 64.32,
      category: 'Food & Dining',
      color: 'amber',
      date: atTime(0, 8, 20),
    },
    {
      id: 'tx-2',
      description: 'Uber',
      amount: 18.5,
      category: 'Transport',
      color: 'blue',
      date: atTime(0, 9, 5),
    },
    {
      id: 'tx-3',
      description: 'Netflix',
      amount: 15.99,
      category: 'Entertainment',
      color: 'pink',
      date: atTime(-1, 10, 0),
    },
    {
      id: 'tx-4',
      description: 'Electric bill',
      amount: 120.0,
      category: 'Bills & Utilities',
      color: 'red',
      date: atTime(-1, 14, 0),
    },
    {
      id: 'tx-5',
      description: 'Zara',
      amount: 89.0,
      category: 'Shopping',
      color: 'violet',
      date: atTime(-2, 16, 30),
    },
  ];
}

export function getMonthlySpendTrend(): { label: string; value: number }[] {
  return [
    { label: 'Mar', value: 1240 },
    { label: 'Apr', value: 1380 },
    { label: 'May', value: 1120 },
    { label: 'Jun', value: 1490 },
    { label: 'Jul', value: 1310 },
    { label: 'Aug', value: 1580 },
  ];
}

export interface MockNote {
  id: string;
  title: string;
  preview: string;
  color: CategoryColorKey;
  pinned: boolean;
  favorite: boolean;
  folder: string;
  updatedAt: Date;
  height: number;
}

export function getSampleNotes(): MockNote[] {
  return [
    {
      id: 'note-1',
      title: 'Apartment hunting checklist',
      preview: 'Natural light, near transit, in-unit laundry, budget under $2400...',
      color: 'indigo',
      pinned: true,
      favorite: true,
      folder: 'Personal',
      updatedAt: atTime(0, 9),
      height: 150,
    },
    {
      id: 'note-2',
      title: 'Book recs from Sam',
      preview: 'Project Hail Mary, The Every, Klara and the Sun',
      color: 'teal',
      pinned: true,
      favorite: false,
      folder: 'Ideas',
      updatedAt: atTime(-1, 20),
      height: 110,
    },
    {
      id: 'note-3',
      title: 'Q3 retro notes',
      preview:
        'What went well: shipped sync engine ahead of schedule. What to improve: earlier design reviews...',
      color: 'violet',
      pinned: false,
      favorite: false,
      folder: 'Work',
      updatedAt: atTime(-2, 15),
      height: 170,
    },
    {
      id: 'note-4',
      title: 'Recipe: miso salmon',
      preview: '2 tbsp miso, 1 tbsp mirin, 1 tsp sesame oil, salmon fillets, broil 8 min',
      color: 'amber',
      pinned: false,
      favorite: true,
      folder: 'Personal',
      updatedAt: atTime(-3, 18),
      height: 130,
    },
    {
      id: 'note-5',
      title: 'Gift ideas',
      preview: 'Dad — noise cancelling headphones. Mira — pottery class voucher.',
      color: 'pink',
      pinned: false,
      favorite: false,
      folder: 'Personal',
      updatedAt: atTime(-4, 12),
      height: 100,
    },
    {
      id: 'note-6',
      title: 'App onboarding copy',
      preview: 'First screen should sell the offline-first pitch in one line, not three.',
      color: 'blue',
      pinned: false,
      favorite: false,
      folder: 'Work',
      updatedAt: atTime(-5, 11),
      height: 140,
    },
  ];
}

export interface MockShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  purchased: boolean;
}

export interface MockShoppingList {
  id: string;
  name: string;
  store: string;
  color: CategoryColorKey;
  items: MockShoppingItem[];
}

export function getSampleShoppingLists(): MockShoppingList[] {
  return [
    {
      id: 'sl-1',
      name: 'Weekly groceries',
      store: 'Trader Joe’s',
      color: 'green',
      items: [
        { id: 'i-1', name: 'Bananas', quantity: '1 bunch', price: 1.99, purchased: true },
        { id: 'i-2', name: 'Oat milk', quantity: '2 cartons', price: 7.98, purchased: true },
        { id: 'i-3', name: 'Chicken thighs', quantity: '2 lb', price: 9.5, purchased: false },
        { id: 'i-4', name: 'Spinach', quantity: '1 bag', price: 3.49, purchased: false },
        { id: 'i-5', name: 'Sourdough bread', quantity: '1 loaf', price: 4.99, purchased: false },
      ],
    },
    {
      id: 'sl-2',
      name: 'Home essentials',
      store: 'Target',
      color: 'blue',
      items: [
        { id: 'i-6', name: 'Paper towels', quantity: '6 rolls', price: 12.99, purchased: false },
        { id: 'i-7', name: 'Dish soap', quantity: '1 bottle', price: 4.29, purchased: false },
        { id: 'i-8', name: 'AA batteries', quantity: '1 pack', price: 8.49, purchased: true },
      ],
    },
    {
      id: 'sl-3',
      name: 'Birthday party',
      store: 'Party City',
      color: 'pink',
      items: [
        { id: 'i-9', name: 'Balloons', quantity: '20 pcs', price: 6.99, purchased: false },
        { id: 'i-10', name: 'Candles', quantity: '1 pack', price: 2.49, purchased: false },
      ],
    },
  ];
}

export function getTaskCompletionTrend(): { label: string; value: number }[] {
  return [
    { label: 'Mon', value: 5 },
    { label: 'Tue', value: 8 },
    { label: 'Wed', value: 4 },
    { label: 'Thu', value: 9 },
    { label: 'Fri', value: 7 },
    { label: 'Sat', value: 3 },
    { label: 'Sun', value: 2 },
  ];
}

export const MOTIVATIONAL_QUOTES = [
  'Small steps every day add up to big change.',
  'Discipline is choosing what you want most over what you want now.',
  'Done is better than perfect.',
  'Progress, not perfection.',
  'You don’t have to see the whole staircase, just take the first step.',
  'Focus on being productive instead of busy.',
];

export function getQuoteOfTheDay(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return MOTIVATIONAL_QUOTES[dayIndex % MOTIVATIONAL_QUOTES.length]!;
}
