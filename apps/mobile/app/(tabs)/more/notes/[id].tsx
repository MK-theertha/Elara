import { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pin, Star, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, ErrorState, IconButton, SkeletonCard, TextInput } from '@/components';
import { categoryColors } from '@/theme/colors';
import { notesApi } from '@/features/notes/api';
import { categoryToColorKey, isFavorite, toggleFavoriteTag } from '@/features/notes/categories';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography } = useTheme();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);

  const {
    data: note,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => notesApi.getById(id),
  });

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loadedNoteId, setLoadedNoteId] = useState<string | null>(null);

  if (note && loadedNoteId !== note.id) {
    setLoadedNoteId(note.id);
    setTitle(note.title);
    setBody(note.body ?? '');
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: 'Note', headerShown: true }} />
        <View style={{ padding: spacing.xl, gap: spacing.sm }}>
          <SkeletonCard />
        </View>
      </View>
    );
  }

  if (isError || !note) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Note', headerShown: true }} />
        <ErrorState title="Note not found" onRetry={() => refetch()} />
      </View>
    );
  }

  const tint = categoryColors[categoryToColorKey(note.category)];
  const favorite = isFavorite(note.tags);

  const handleSave = async () => {
    try {
      await notesApi.update(note.id, { title: title.trim() || 'Untitled', body });
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      showToast('Note saved', 'success');
      router.back();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
    }
  };

  const handleTogglePin = async () => {
    try {
      await notesApi.update(note.id, { pinned: !note.pinned });
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await notesApi.update(note.id, { tags: toggleFavoriteTag(note.tags) });
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete note', 'This note will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesApi.delete(note.id);
            await queryClient.invalidateQueries({ queryKey: ['notes'] });
            router.back();
          } catch (err) {
            showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
          }
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
          headerShown: true,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <IconButton
                icon={Pin}
                accessibilityLabel={note.pinned ? 'Unpin note' : 'Pin note'}
                color={note.pinned ? tint : colors.textSecondary}
                onPress={handleTogglePin}
              />
              <IconButton
                icon={Star}
                accessibilityLabel={favorite ? 'Unfavorite note' : 'Favorite note'}
                color={favorite ? colors.warning : colors.textSecondary}
                onPress={handleToggleFavorite}
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
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {note.category ?? 'Uncategorized'}
          </Text>
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
