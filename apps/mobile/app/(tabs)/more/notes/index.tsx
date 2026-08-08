import { useMemo, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Pin, Plus, Star, StickyNote } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import {
  AnimatedPressable,
  Chip,
  EmptyState,
  FloatingButton,
  IconButton,
  ScreenHeader,
  SearchBar,
} from '@/components';
import { categoryColors } from '@/theme/colors';
import { useNotesStore } from '@/stores/notes-store';
import type { MockNote } from '@/lib/mock-data';

function NoteCard({
  note,
  onPress,
  onToggleFavorite,
}: {
  note: MockNote;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const tint = categoryColors[note.color];

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
        minHeight: note.height,
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
}

export default function NotesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((s) => s.notes);
  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState<string | null>(null);

  const folders = useMemo(() => Array.from(new Set(notes.map((n) => n.folder))), [notes]);

  const filtered = useMemo(
    () =>
      notes.filter((n) => {
        if (folder && n.folder !== folder) return false;
        if (query && !`${n.title} ${n.preview}`.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [notes, folder, query],
  );

  const pinned = filtered.filter((n) => n.pinned);
  const rest = filtered.filter((n) => !n.pinned);
  const columns: MockNote[][] = [[], []];
  rest.forEach((note, i) => columns[i % 2]!.push(note));

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
        {folders.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
          >
            <Chip label="All" selected={folder === null} onPress={() => setFolder(null)} />
            {folders.map((f) => (
              <Chip key={f} label={f} selected={folder === f} onPress={() => setFolder(f)} />
            ))}
          </ScrollView>
        ) : null}
      </View>

      {filtered.length === 0 ? (
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
                  onToggleFavorite={() => toggleFavorite(note.id)}
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
                    onToggleFavorite={() => toggleFavorite(note.id)}
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
