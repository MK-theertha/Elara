export const radius = {
  input: 18,
  button: 18,
  card: 24,
  bottomSheet: 32,
  fab: 28,
  chip: 999,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;
