import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, Button, DatePicker, TextInput } from '@/components';
import { categoryColors, type CategoryColorKey } from '@/theme/colors';
import { useToastStore } from '@/stores/toast-store';

const COLOR_OPTIONS: CategoryColorKey[] = [
  'indigo',
  'violet',
  'green',
  'amber',
  'red',
  'blue',
  'pink',
  'teal',
];

export default function CreateEventScreen() {
  const { colors, spacing, typography } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState<CategoryColorKey>('indigo');

  const handleSubmit = () => {
    if (!title.trim()) return;
    showToast('Event created', 'success');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'New Event' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput label="Title" value={title} onChangeText={setTitle} autoFocus />
        <TextInput label="Location (optional)" value={location} onChangeText={setLocation} />

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Date</Text>
          <DatePicker value={date} onChange={setDate} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Start time"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              label="End time"
              value={endTime}
              onChangeText={setEndTime}
              placeholder="10:00"
            />
          </View>
        </View>

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Color</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {COLOR_OPTIONS.map((c) => (
              <AnimatedPressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`${c} color`}
                accessibilityState={{ selected: color === c }}
                onPress={() => setColor(c)}
                scaleTo={0.85}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: categoryColors[c],
                  borderWidth: color === c ? 3 : 0,
                  borderColor: colors.surface,
                }}
              />
            ))}
          </View>
        </View>

        <Button label="Create Event" onPress={handleSubmit} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
