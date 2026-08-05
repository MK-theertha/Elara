import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { Chip, EmptyState, ScreenHeader } from '@/components';

const VIEWS = ['Today', 'Upcoming', 'Completed', 'All'] as const;
type TaskView = (typeof VIEWS)[number];

export default function TasksScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<TaskView>('Today');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Tasks" />
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
          icon="checkbox-outline"
          title={`No ${view.toLowerCase()} tasks`}
          description="Tap the + button to create your first task."
        />
      </ScrollView>
    </View>
  );
}
