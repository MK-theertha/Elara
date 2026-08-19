import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { createEventSchema } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, Chip, DatePicker, TextInput } from '@/components';
import { categoryColors } from '@/theme/colors';
import { useToastStore } from '@/stores/toast-store';
import { eventsApi } from '@/features/calendar/api';
import { categoryToColorKey, EVENT_CATEGORIES } from '@/features/calendar/categories';
import { ApiError } from '@/lib/api-client';

function combineDateAndTime(date: Date, time: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export default function CreateEventScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const startAt = combineDateAndTime(date, startTime);
    const endAt = combineDateAndTime(date, endTime);
    if (!startAt || !endAt) {
      setError('Enter start/end time as HH:MM.');
      return;
    }

    const parsed = createEventSchema.safeParse({
      title: title.trim(),
      location: location.trim() || undefined,
      category: category ?? undefined,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      recurrence: 'NONE',
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Something went wrong.');
      return;
    }

    setSubmitting(true);
    try {
      await eventsApi.create(parsed.data);
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      showToast('Event created', 'success');
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
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
        {error ? (
          <View
            style={{
              backgroundColor: colors.danger,
              borderRadius: radius.button,
              padding: spacing.sm,
            }}
          >
            <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{error}</Text>
          </View>
        ) : null}

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
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Category (optional)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {EVENT_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                color={categoryColors[categoryToColorKey(c)]}
                onPress={() => setCategory((current) => (current === c ? null : c))}
              />
            ))}
          </View>
        </View>

        <Button label="Create Event" onPress={handleSubmit} loading={submitting} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
