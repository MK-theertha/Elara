import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, Button, TextInput } from '@/components';
import { categoryColors, type CategoryColorKey } from '@/theme/colors';
import { useNotesStore } from '@/stores/notes-store';
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
const FOLDERS = ['Personal', 'Work', 'Ideas'];

export default function CreateNoteScreen() {
  const { colors, spacing, typography } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const addNote = useNotesStore((s) => s.addNote);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<CategoryColorKey>('indigo');
  const [folder, setFolder] = useState(FOLDERS[0]!);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const id = addNote({ title: title.trim(), preview: body.trim(), color, folder });
    showToast('Note created', 'success');
    router.replace(`/(tabs)/more/notes/${id}`);
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
        <TextInput label="Title" value={title} onChangeText={setTitle} autoFocus />
        <TextInput
          label="Note (optional)"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={6}
        />

        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Folder</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {FOLDERS.map((f) => (
              <AnimatedPressable
                key={f}
                accessibilityRole="button"
                onPress={() => setFolder(f)}
                scaleTo={0.95}
                style={{
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: spacing.xs,
                  borderRadius: 999,
                  backgroundColor: folder === f ? colors.primary : colors.backgroundSecondary,
                }}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: folder === f ? colors.onPrimary : colors.text },
                  ]}
                >
                  {f}
                </Text>
              </AnimatedPressable>
            ))}
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

        <Button label="Create Note" onPress={handleSubmit} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
