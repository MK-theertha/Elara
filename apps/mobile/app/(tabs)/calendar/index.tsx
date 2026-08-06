import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { startOfMonth, startOfWeek } from '@elara/shared';
import { useTheme } from '@/theme/useTheme';
import {
  EmptyState,
  FloatingButton,
  IconButton,
  ScreenHeader,
  SegmentedControl,
} from '@/components';
import { CalendarCard } from '@/components/cards';
import { categoryColors } from '@/theme/colors';
import { getSampleEvents } from '@/lib/mock-data';
import { buildMonthGrid, isSameDay } from '@/components/DatePicker';

type CalendarView = 'month' | 'week' | 'agenda';

const VIEWS: { label: string; value: CalendarView }[] = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Agenda', value: 'agenda' },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));

  const events = useMemo(() => getSampleEvents(), []);
  const eventsByDay = (date: Date) =>
    events
      .filter((e) => isSameDay(e.start, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

  const selectedDayEvents = eventsByDay(selectedDate);

  const agendaGroups = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const map = new Map<string, typeof events>();
    for (const event of sorted) {
      const key = event.start.toDateString();
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [events]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Calendar" />

      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <SegmentedControl options={VIEWS} value={view} onChange={setView} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          gap: spacing.md,
          paddingBottom: insets.bottom + 140,
        }}
      >
        {view === 'month' ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={[typography.cardTitle, { color: colors.text }]}>
                {monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.xxs }}>
                <IconButton
                  icon={ChevronLeft}
                  accessibilityLabel="Previous month"
                  variant="filled"
                  onPress={() =>
                    setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  }
                />
                <IconButton
                  icon={ChevronRight}
                  accessibilityLabel="Next month"
                  variant="filled"
                  onPress={() =>
                    setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  }
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              {WEEKDAY_LABELS.map((label, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[typography.tinyLabel, { color: colors.textTertiary }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {buildMonthGrid(monthAnchor).map((date, i) => {
                if (!date) return <View key={i} style={{ width: `${100 / 7}%`, height: 52 }} />;
                const dayEvents = eventsByDay(date);
                const selected = isSameDay(date, selectedDate);
                const today = isSameDay(date, new Date());
                return (
                  <View
                    key={i}
                    style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 }}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={date.toDateString()}
                      onPress={() => setSelectedDate(date)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? colors.primary : 'transparent',
                        borderWidth: today && !selected ? 1.5 : 0,
                        borderColor: colors.primary,
                        gap: 2,
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
                    </Pressable>
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 3, height: 4 }}>
                      {dayEvents.slice(0, 3).map((e) => (
                        <View
                          key={e.id}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: categoryColors[e.color],
                          }}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <Text style={[typography.sectionTitle, { color: colors.text }]}>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((e) => (
                  <CalendarCard
                    key={e.id}
                    title={e.title}
                    start={e.start}
                    end={e.end}
                    color={e.color}
                    location={e.location}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CalendarPlus}
                  title="Nothing scheduled"
                  description="Tap + to add an event for this day."
                />
              )}
            </View>
          </>
        ) : null}

        {view === 'week' ? (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.xxs }}>
              {weekDays.map((d) => {
                const dayEvents = eventsByDay(d);
                const selected = isSameDay(d, selectedDate);
                return (
                  <Pressable
                    key={d.toISOString()}
                    accessibilityRole="button"
                    accessibilityLabel={d.toDateString()}
                    onPress={() => setSelectedDate(d)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.button,
                      backgroundColor: selected ? colors.primary : colors.backgroundSecondary,
                    }}
                  >
                    <Text
                      style={[
                        typography.tinyLabel,
                        { color: selected ? colors.onPrimary : colors.textTertiary },
                      ]}
                    >
                      {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)}
                    </Text>
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: selected ? colors.onPrimary : colors.text },
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 2, height: 4 }}>
                      {dayEvents.slice(0, 3).map((e) => (
                        <View
                          key={e.id}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: selected ? colors.onPrimary : categoryColors[e.color],
                          }}
                        />
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <Text style={[typography.sectionTitle, { color: colors.text }]}>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((e) => (
                  <CalendarCard
                    key={e.id}
                    title={e.title}
                    start={e.start}
                    end={e.end}
                    color={e.color}
                    location={e.location}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CalendarPlus}
                  title="Nothing scheduled"
                  description="Tap + to add an event for this day."
                />
              )}
            </View>
          </>
        ) : null}

        {view === 'agenda' ? (
          agendaGroups.length > 0 ? (
            agendaGroups.map(([dateKey, dayEvents]) => (
              <View key={dateKey} style={{ gap: spacing.sm }}>
                <Text style={[typography.sectionTitle, { color: colors.text }]}>
                  {new Date(dateKey).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {dayEvents.map((e) => (
                    <CalendarCard
                      key={e.id}
                      title={e.title}
                      start={e.start}
                      end={e.end}
                      color={e.color}
                      location={e.location}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon={CalendarPlus} title="No events" description="Your agenda is clear." />
          )
        ) : null}
      </ScrollView>

      <View style={{ position: 'absolute', right: spacing.md, bottom: insets.bottom + 100 }}>
        <FloatingButton
          icon={CalendarPlus}
          accessibilityLabel="Add event"
          onPress={() => router.push('/create/event')}
        />
      </View>
    </View>
  );
}
