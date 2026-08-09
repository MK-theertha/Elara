import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader } from '@/components';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. Acceptance of terms',
    body: 'By creating an account or using Elara, you agree to these Terms of Service. If you don’t agree, please don’t use the app.',
  },
  {
    heading: '2. What Elara is',
    body: 'Elara is a personal productivity app for managing tasks, calendar events, notes, expenses, and shopping lists. It’s designed offline-first: your data is usable without a network connection and syncs when you’re back online.',
  },
  {
    heading: '3. Your account',
    body: 'You’re responsible for keeping your login credentials secure and for all activity under your account. Tell us right away if you suspect unauthorized access.',
  },
  {
    heading: '4. Acceptable use',
    body: 'Use Elara for its intended purpose — organizing your own tasks, notes, and finances. Don’t use it to store unlawful content, attempt to disrupt the service, or access accounts that aren’t yours.',
  },
  {
    heading: '5. Your content',
    body: 'You own everything you create in Elara — tasks, notes, expenses, and lists. We don’t claim any rights to it beyond what’s needed to store, sync, and display it back to you.',
  },
  {
    heading: '6. Offline data and sync',
    body: 'Some data (like notes and shopping lists) may live only on your device until sync support for those features ships. Uninstalling the app or clearing local data can permanently remove content that hasn’t synced.',
  },
  {
    heading: '7. Termination',
    body: 'You can stop using Elara and delete your account at any time. We may suspend accounts that violate these terms.',
  },
  {
    heading: '8. Disclaimer',
    body: 'Elara is provided “as is.” We work hard to keep it reliable, but we don’t guarantee it will always be available, error-free, or fit for every purpose.',
  },
  {
    heading: '9. Changes to these terms',
    body: 'We may update these terms as the app evolves. Meaningful changes will be reflected here with an updated date.',
  },
  {
    heading: '10. Contact',
    body: 'Questions about these terms? Reach out through the app’s support channel.',
  },
];

export default function TermsScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Terms of Service"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 0, gap: spacing.lg }}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>
          Last updated August 2026
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.heading} style={{ gap: spacing.xxs }}>
            <Text style={[typography.cardTitle, { color: colors.text }]}>{section.heading}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
