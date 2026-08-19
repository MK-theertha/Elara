import { memo, useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronLeft, Pin, Plus, Star, StickyNote } from 'lucide-react-native';
import type { NoteDto } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import {
  AnimatedPressable,
  Chip,
  EmptyState,
  ErrorState,
  FloatingButton,
  IconButton,
  ScreenHeader,
  SearchBar,
  SkeletonCard,
} from '@/components';
import { categoryColors } from '@/theme/colors';
import { hashedCardHeight } from '@/lib/category-color';
import { notesApi } from '@/features/notes/api';
import { categoryToColorKey, isFavorite, toggleFavoriteTag } from '@/features/notes/categories';
import { useToastStore } from '@/stores/toast-store';
import { ApiError } from '@/lib/api-client';

interface NoteViewModel {
  id: string;
  title: string;
  preview: string;
  category: string;
  pinned: boolean;
  favorite: boolean;
  tags: string[];
}

function toViewModel(note: NoteDto): NoteViewModel {
  return {
    id: note.id,
    title: note.title,
    preview: note.body ?? '',
    category: note.category ?? 'Uncategorized',
    pinned: note.pinned,
    favorite: isFavorite(note.tags),
    tags: note.tags,
  };
}

const NoteCard = memo(function NoteCard({
  note,
  onPress,
  onToggleFavorite,
}: {
  note: NoteViewModel;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const tint = categoryColors[categoryToColorKey(note.category)];

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      scaleTo={0.97}
      style={{
        backgroundColor: `${tint}12`,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: `${tint}22`,
        padding: spacing.sm + 2,
        minHeight: hashedCardHeight(note.id),
        gap: spacing.xs,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {note.pinned ? <Pin size={13} color={tint} strokeWidth={2} /> : <View />}
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Toggle favorite"
          onPress={onToggleFavorite}
          hitSlop={8}
          scaleTo={0.8}
        >
          <Star
            size={15}
            color={note.favorite ? colors.warning : colors.textTertiary}
            fill={note.favorite ? colors.warning : 'none'}
            strokeWidth={1.75}
          />
        </AnimatedPressable>
      </View>
      <Text style={[typography.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {note.title}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={4}>
        {note.preview}
      </Text>
    </AnimatedPressable>
  );
});

export default function NotesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const {
    data: notesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesApi.list(),
  });

  const notes = useMemo(() => (notesData ?? []).map(toViewModel), [notesData]);

  const categories = useMemo(() => Array.from(new Set(notes.map((n) => n.category))), [notes]);

  const filtered = useMemo(
    () =>
      notes.filter((n) => {
        if (category && n.category !== category) return false;
        if (query && !`${n.title} ${n.preview}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [notes, category, query],
  );

  const { pinned, columns } = useMemo(() => {
    const pinnedNotes = filtered.filter((n) => n.pinned);
    const rest = filtered.filter((n) => !n.pinned);
    const cols: NoteViewModel[][] = [[], []];
    rest.forEach((note, i) => cols[i % 2]!.push(note));
    return { pinned: pinnedNotes, columns: cols };
  }, [filtered]);

  const handleToggleFavorite = async (note: NoteViewModel) => {
    try {
      await notesApi.update(note.id, { tags: toggleFavoriteTag(note.tags) });
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong', 'danger');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader
        title="Notes"
        accessory={
          <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={() => router.back()} />
        }
      />
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.sm }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search notes" />
        {categories.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            <Chip label="All" selected={category === null} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <ErrorState description="Couldn't load your notes." onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes found"
          description="Try a different search, or create a new note."
          actionLabel="New note"
          onActionPress={() => router.push('/create/note')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            gap: spacing.md,
            paddingBottom: insets.bottom + 140,
          }}
        >
          {pinned.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {pinned.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPress={() => router.push(`/(tabs)/more/notes/${note.id}`)}
                  onToggleFavorite={() => handleToggleFavorite(note)}
                />
              ))}
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {columns.map((col, i) => (
              <View key={i} style={{ flex: 1, gap: spacing.sm }}>
                {col.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPress={() => router.push(`/(tabs)/more/notes/${note.id}`)}
                    onToggleFavorite={() => handleToggleFavorite(note)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={{ position: 'absolute', right: spacing.md, bottom: insets.bottom + 100 }}>
        <FloatingButton
          icon={Plus}
          accessibilityLabel="New note"
          onPress={() => router.push('/create/note')}
        />
      </View>
    </View>
  );
}
