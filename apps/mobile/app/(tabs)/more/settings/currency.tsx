import { useMemo, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader, SearchBar } from '@/components';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { usePreferencesStore } from '@/stores/preferences-store';
import { CURRENCY_OPTIONS } from '@/lib/preference-options';

export default function CurrencyScreen() {
  const { colors, spacing, typography } = useTheme();
  const currency = usePreferencesStore((s) => s.currency);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      CURRENCY_OPTIONS.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.code.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Currency"
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
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search currencies" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs }}
        renderItem={({ item }) => {
          const selected = item.code === currency;
          return (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setCurrency(item.code);
                router.back();
              }}
              scaleTo={0.98}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.sm + 2,
                paddingHorizontal: spacing.sm,
                borderRadius: 14,
                backgroundColor: selected ? `${colors.primary}12` : 'transparent',
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[typography.caption, { color: colors.text }]}>{item.symbol}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>{item.label}</Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>
                  {item.code}
                </Text>
              </View>
              {selected ? <Check size={18} color={colors.primary} strokeWidth={2} /> : null}
            </AnimatedPressable>
          );
        }}
      />
    </View>
  );
}
