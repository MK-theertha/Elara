import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { Card, ListItem, ScreenHeader, Section } from '@/components';
import { useToastStore } from '@/stores/toast-store';

const SETTINGS_ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Profile', icon: 'person-outline' },
  { label: 'Notifications', icon: 'notifications-outline' },
  { label: 'Appearance', icon: 'color-palette-outline' },
  { label: 'Language', icon: 'language-outline' },
  { label: 'Timezone', icon: 'time-outline' },
  { label: 'Currency', icon: 'cash-outline' },
  { label: 'Security', icon: 'lock-closed-outline' },
  { label: 'Data & Privacy', icon: 'shield-checkmark-outline' },
  { label: 'About Elara', icon: 'information-circle-outline' },
];

export default function MoreScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  const notImplemented = (label: string) => showToast(`${label} is coming in a later phase`);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: spacing.xxxl,
        gap: spacing.lg,
      }}
    >
      <ScreenHeader title="More" />

      <Section title="Your Data">
        <View style={{ paddingHorizontal: spacing.md }}>
          <Card padded={false}>
            <ListItem
              title="Notes"
              leadingIcon="document-text-outline"
              showChevron
              onPress={() => notImplemented('Notes')}
            />
            <ListItem
              title="Shopping Lists"
              leadingIcon="cart-outline"
              showChevron
              onPress={() => notImplemented('Shopping lists')}
            />
          </Card>
        </View>
      </Section>

      <Section title="Settings">
        <View style={{ paddingHorizontal: spacing.md }}>
          <Card padded={false}>
            {SETTINGS_ITEMS.map((item) => (
              <ListItem
                key={item.label}
                title={item.label}
                leadingIcon={item.icon}
                showChevron
                onPress={() => notImplemented(item.label)}
              />
            ))}
          </Card>
        </View>
      </Section>

      <View style={{ paddingHorizontal: spacing.md }}>
        <Card padded={false}>
          <ListItem
            title="Logout"
            leadingIcon="log-out-outline"
            onPress={() => notImplemented('Authentication')}
          />
        </Card>
      </View>
    </ScrollView>
  );
}
