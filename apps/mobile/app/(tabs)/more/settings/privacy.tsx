import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader } from '@/components';

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Information we collect',
    body: 'Your account email and name, plus the content you create — tasks, calendar events, notes, expenses, and shopping lists.',
  },
  {
    heading: 'How we use it',
    body: 'Solely to run the app for you: storing and syncing your data across devices, authenticating your account, and sending the reminders you’ve opted into. We don’t use your content to train models or serve ads.',
  },
  {
    heading: 'Local-first storage',
    body: 'Tasks, calendar events, and expenses sync with your account once you’re signed in. Notes and shopping lists currently live only on this device — they’re not uploaded anywhere.',
  },
  {
    heading: 'Third-party sharing',
    body: 'We don’t sell your data or share it with advertisers. There are no third-party analytics or tracking SDKs in Elara today.',
  },
  {
    heading: 'Data retention',
    body: 'Your data is kept for as long as your account is active. Deleting a task, note, or your account removes the underlying data — soft-deleted items pass through a short recovery window (like the “Undo” option after deleting a task) before permanent removal.',
  },
  {
    heading: 'Your rights',
    body: 'You can export a backup of your on-device data at any time from Settings, and clear local data (notes and shopping lists) from Data & Privacy. You can delete your account and all associated data on request.',
  },
  {
    heading: 'Security',
    body: 'Passwords are hashed, never stored in plain text. Session tokens live in your device’s secure keychain, not in plain storage. You can additionally require Face ID / Touch ID to open the app from Settings → Security.',
  },
  {
    heading: 'Children’s privacy',
    body: 'Elara isn’t directed at children under 13, and we don’t knowingly collect data from them.',
  },
  {
    heading: 'Changes to this policy',
    body: 'If this policy changes in a meaningful way, we’ll update the date below and let you know in-app.',
  },
];

export default function PrivacyScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Privacy Policy"
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
