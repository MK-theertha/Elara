import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import {
  BarChart3,
  ChevronRight,
  LogOut,
  Settings as SettingsIcon,
  Sparkles,
  ShoppingCart,
  StickyNote,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { AnimatedPressable, Avatar, Card, ListItem, ScreenHeader, Section } from '@/components';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/features/auth/api';

const WORKSPACE_ITEMS = [
  { label: 'Notes', icon: StickyNote, route: '/(tabs)/more/notes' as const },
  { label: 'Shopping Lists', icon: ShoppingCart, route: '/(tabs)/more/shopping' as const },
  { label: 'Analytics', icon: BarChart3, route: '/(tabs)/more/analytics' as const },
  { label: 'AI Assistant', icon: Sparkles, route: '/ai' as const },
];

export default function MoreScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [loggingOut, setLoggingOut] = useState(false);

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
        paddingBottom: insets.bottom + 140,
        gap: spacing.lg,
      }}
    >
      <ScreenHeader title="More" />

      {user ? (
        <View style={{ paddingHorizontal: spacing.md }}>
          <AnimatedPressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/more/profile')}
            scaleTo={0.98}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Avatar name={user.name ?? user.email} size={52} ring />
            <View style={{ flex: 1 }}>
              <Text style={[typography.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {user.name ?? 'Welcome'}
              </Text>
              <Text
                style={[typography.bodySmall, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {user.email}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} strokeWidth={1.75} />
          </AnimatedPressable>
        </View>
      ) : null}

      <Section title="Workspace">
        <View style={{ paddingHorizontal: spacing.md }}>
          <Card padded={false}>
            {WORKSPACE_ITEMS.map((item) => (
              <ListItem
                key={item.label}
                title={item.label}
                leadingIcon={item.icon}
                showChevron
                onPress={() => router.push(item.route)}
              />
            ))}
          </Card>
        </View>
      </Section>

      <Section title="Preferences">
        <View style={{ paddingHorizontal: spacing.md }}>
          <Card padded={false}>
            <ListItem
              title="Settings"
              subtitle="Appearance, notifications, security"
              leadingIcon={SettingsIcon}
              showChevron
              onPress={() => router.push('/(tabs)/more/settings')}
            />
          </Card>
        </View>
      </Section>

      <View style={{ paddingHorizontal: spacing.md }}>
        <Card padded={false}>
          <ListItem
            title={loggingOut ? 'Logging out...' : 'Logout'}
            leadingIcon={LogOut}
            onPress={loggingOut ? undefined : handleLogout}
          />
        </Card>
      </View>
    </ScrollView>
  );
}
