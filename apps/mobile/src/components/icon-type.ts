import type { ComponentType } from 'react';

/** Structural type for a lucide-react-native icon component — narrower than the library's
 * own (unexported) LucideIcon type, but wide enough to accept any icon from the set. */
export type IconType = ComponentType<{
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
}>;
