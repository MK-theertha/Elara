import { useState } from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

const QUICK_ACTIONS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/create/task' | '/create/note' | '/create/expense' | '/create/event';
}[] = [
  { label: 'Task', icon: 'checkbox-outline', route: '/create/task' },
  { label: 'Note', icon: 'document-text-outline', route: '/create/note' },
  { label: 'Expense', icon: 'cash-outline', route: '/create/expense' },
  { label: 'Event', icon: 'calendar-outline', route: '/create/event' },
];

export function QuickActionFab() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const handleSelect = (route: (typeof QUICK_ACTIONS)[number]['route']) => {
    setOpen(false);
    router.push(route);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create new item"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          shadows.lg,
          {
            bottom: insets.bottom + 72,
            backgroundColor: colors.primary,
            borderRadius: radius.full,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="Close quick actions"
          onPress={() => setOpen(false)}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.sheet,
              shadows.lg,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
          >
            <Text style={[typography.label, { color: colors.textSecondary, padding: spacing.md }]}>
              QUICK ACTIONS
            </Text>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.route}
                accessibilityRole="button"
                onPress={() => handleSelect(action.route)}
                style={({ pressed }) => [
                  styles.row,
                  { paddingHorizontal: spacing.md, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Ionicons name={action.icon} size={22} color={colors.primary} />
                <Text style={[typography.body, { color: colors.text }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
  },
});
