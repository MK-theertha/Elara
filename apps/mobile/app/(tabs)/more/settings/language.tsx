import { useMemo, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft, Globe } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader, SearchBar } from '@/components';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { usePreferencesStore } from '@/stores/preferences-store';
import { LANGUAGE_OPTIONS } from '@/lib/preference-options';

export default function LanguageScreen() {
  const { colors, spacing, typography } = useTheme();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => LANGUAGE_OPTIONS.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Language"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.xs,
            backgroundColor: `${colors.info}12`,
            borderRadius: 12,
            padding: spacing.sm,
          }}
        >
          <Globe size={16} color={colors.info} strokeWidth={1.75} />
          <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
            This sets your preferred language for future updates — full interface translation is
            coming soon.
          </Text>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search languages" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs }}
        renderItem={({ item }) => {
          const selected = item.code === language;
          return (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setLanguage(item.code);
                router.back();
              }}
              scaleTo={0.98}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.sm + 2,
                paddingHorizontal: spacing.sm,
                borderRadius: 14,
                backgroundColor: selected ? `${colors.primary}12` : 'transparent',
              }}
            >
              <Text style={[typography.body, { color: colors.text }]}>{item.label}</Text>
              {selected ? <Check size={18} color={colors.primary} strokeWidth={2} /> : null}
            </AnimatedPressable>
          );
        }}
      />
    </View>
  );
}
