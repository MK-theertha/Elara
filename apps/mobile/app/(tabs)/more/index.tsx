import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { Avatar, Card, ListItem, ScreenHeader, Section } from '@/components';
import { useToastStore } from '@/stores/toast-store';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/features/auth/api';

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
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [loggingOut, setLoggingOut] = useState(false);

  const notImplemented = (label: string) => showToast(`${label} is coming in a later phase`);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await clearSession();
      setLoggingOut(false);
    }
  };

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

      {user ? (
        <View style={{ paddingHorizontal: spacing.md }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Avatar name={user.name ?? user.email} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.subheading, { color: colors.text }]} numberOfLines={1}>
                  {user.name ?? 'Welcome'}
                </Text>
                <Text
                  style={[typography.bodySmall, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {user.email}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      ) : null}

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
            title={loggingOut ? 'Logging out...' : 'Logout'}
            leadingIcon="log-out-outline"
            onPress={loggingOut ? undefined : handleLogout}
          />
        </Card>
      </View>
    </ScrollView>
  );
}
