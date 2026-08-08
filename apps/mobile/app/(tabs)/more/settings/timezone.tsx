import { useMemo, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader, SearchBar } from '@/components';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { usePreferencesStore } from '@/stores/preferences-store';
import { getTimezoneOptions } from '@/lib/preference-options';

const AUTOMATIC = 'Automatic';

export default function TimezoneScreen() {
  const { colors, spacing, typography } = useTheme();
  const timezone = usePreferencesStore((s) => s.timezone);
  const setTimezone = usePreferencesStore((s) => s.setTimezone);
  const [query, setQuery] = useState('');

  const options = useMemo(() => [AUTOMATIC, ...getTimezoneOptions()], []);
  const filtered = useMemo(
    () => options.filter((tz) => tz.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Timezone"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <View style={{ paddingHorizontal: spacing.md }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search timezones" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs }}
        renderItem={({ item }) => {
          const selected = item === timezone;
          return (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setTimezone(item);
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
              <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
                {item.replace(/_/g, ' ')}
              </Text>
              {selected ? <Check size={18} color={colors.primary} strokeWidth={2} /> : null}
            </AnimatedPressable>
          );
        }}
      />
    </View>
  );
}
