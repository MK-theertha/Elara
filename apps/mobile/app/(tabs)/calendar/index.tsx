import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { Chip, EmptyState, ScreenHeader } from '@/components';

const VIEWS = ['Day', 'Week', 'Month'] as const;
type CalendarView = (typeof VIEWS)[number];

export default function CalendarScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<CalendarView>('Month');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Calendar" />
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        {VIEWS.map((v) => (
          <Chip key={v} label={v} selected={view === v} onPress={() => setView(v)} />
        ))}
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="calendar-outline"
          title="Nothing scheduled"
          description="Events you create will show up in this view."
        />
      </ScrollView>
    </View>
  );
}
