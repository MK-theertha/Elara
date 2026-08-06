import { useState } from 'react';
import { View, Text } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { startOfMonth } from '@elara/shared';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable } from './AnimatedPressable';
import { IconButton } from './IconButton';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(monthAnchor: Date): (Date | null)[] {
  const first = startOfMonth(monthAnchor);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leadingBlanks = first.getDay();
  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

/** Lightweight inline month-grid date picker — no external calendar dependency. Also
 * powers the Calendar screen's month view grid. */
export function DatePicker({ value, onChange }: DatePickerProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(value));
  const today = new Date();
  const cells = buildMonthGrid(monthAnchor);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[typography.cardTitle, { color: colors.text }]}>
          {monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xxs }}>
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Previous month"
            variant="filled"
            onPress={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          />
          <IconButton
            icon={ChevronRight}
            accessibilityLabel="Next month"
            variant="filled"
            onPress={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[typography.tinyLabel, { color: colors.textTertiary }]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((date, i) => {
          if (!date) return <View key={i} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const selected = isSameDay(date, value);
          const isToday = isSameDay(date, today);

          return (
            <View
              key={i}
              style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}
            >
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={date.toDateString()}
                onPress={() => onChange(date)}
                scaleTo={0.88}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? colors.primary : 'transparent',
                  borderWidth: isToday && !selected ? 1.5 : 0,
                  borderColor: colors.primary,
                }}
              >
                <Text
                  style={[
                    typography.bodySmall,
                    { color: selected ? colors.onPrimary : colors.text },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </AnimatedPressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export { buildMonthGrid, isSameDay };
