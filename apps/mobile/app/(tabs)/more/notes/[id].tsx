import { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Pin, Star, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, ErrorState, IconButton, TextInput } from '@/components';
import { categoryColors } from '@/theme/colors';
import { useNotesStore } from '@/stores/notes-store';
import { useToastStore } from '@/stores/toast-store';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const note = useNotesStore((s) => s.notes.find((n) => n.id === id));
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.preview ?? '');

  if (!note) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Note' }} />
        <ErrorState title="Note not found" onRetry={() => router.back()} />
      </View>
    );
  }

  const tint = categoryColors[note.color];

  const handleSave = () => {
    updateNote(note.id, { title: title.trim() || 'Untitled', preview: body });
    showToast('Note saved', 'success');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete note', 'This note will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(note.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Note',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <IconButton
                icon={Pin}
                accessibilityLabel={note.pinned ? 'Unpin note' : 'Pin note'}
                color={note.pinned ? tint : colors.textSecondary}
                onPress={() => togglePin(note.id)}
              />
              <IconButton
                icon={Star}
                accessibilityLabel={note.favorite ? 'Unfavorite note' : 'Favorite note'}
                color={note.favorite ? colors.warning : colors.textSecondary}
                onPress={() => toggleFavorite(note.id)}
              />
              <IconButton
                icon={Trash2}
                accessibilityLabel="Delete note"
                color={colors.danger}
                onPress={handleDelete}
              />
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tint }} />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{note.folder}</Text>
        </View>
        <TextInput value={title} onChangeText={setTitle} placeholder="Title" />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Start writing..."
          multiline
          numberOfLines={10}
        />
        <AnimatedPressable
          accessibilityRole="button"
          onPress={handleSave}
          scaleTo={0.97}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.primary,
            borderRadius: 18,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
          }}
        >
          <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>Save</Text>
        </AnimatedPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
