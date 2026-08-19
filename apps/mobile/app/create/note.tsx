import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { createNoteSchema } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, Chip, TextInput } from '@/components';
import { categoryColors } from '@/theme/colors';
import { notesApi } from '@/features/notes/api';
import { categoryToColorKey, NOTE_CATEGORIES } from '@/features/notes/categories';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';

export default function CreateNoteScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(NOTE_CATEGORIES[0]!);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const parsed = createNoteSchema.safeParse({
      title: title.trim(),
      body: body.trim() || undefined,
      category,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Something went wrong.');
      return;
    }

    setSubmitting(true);
    try {
      const note = await notesApi.create(parsed.data);
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      showToast('Note created', 'success');
      router.replace(`/(tabs)/more/notes/${note.id}`);
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
      <Stack.Screen options={{ title: 'New Note' }} />
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
        <TextInput
          label="Note (optional)"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={6}
        />

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {NOTE_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                color={categoryColors[categoryToColorKey(c)]}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
        </View>

        <Button label="Create Note" onPress={handleSubmit} loading={submitting} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
