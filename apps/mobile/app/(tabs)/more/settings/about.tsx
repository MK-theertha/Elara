import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Card, IconButton, ListItem, ScreenHeader } from '@/components';

export default function AboutScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="About Elara"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, alignItems: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.card,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[typography.displayLarge, { color: colors.onPrimary, fontSize: 30 }]}>
              E
            </Text>
          </View>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>Elara</Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            Version {version}
          </Text>
        </View>

        <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          Your life, intelligently organized. Tasks, calendar, notes, expenses, and shopping lists —
          built offline-first, so it&apos;s fast and reliable wherever you are.
        </Text>

        <View style={{ width: '100%', gap: spacing.sm }}>
          <Card padded={false}>
            <ListItem
              title="Terms of Service"
              showChevron
              onPress={() => router.push('/(tabs)/more/settings/terms' as never)}
            />
            <ListItem
              title="Privacy Policy"
              showChevron
              onPress={() => router.push('/(tabs)/more/settings/privacy')}
            />
            <ListItem
              title="Open Source Licenses"
              showChevron
              onPress={() => router.push('/(tabs)/more/settings/licenses')}
            />
          </Card>
        </View>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: spacing.md }}
        >
          <Text style={[typography.caption, { color: colors.textTertiary }]}>Made with</Text>
          <Heart size={12} color={colors.danger} fill={colors.danger} strokeWidth={0} />
        </View>
      </ScrollView>
    </View>
  );
}
