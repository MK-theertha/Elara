import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Cloud,
  DatabaseBackup,
  Fingerprint,
  Globe,
  Info,
  Palette,
  Shield,
  Wallet,
} from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import {
  Card,
  IconButton,
  ListItem,
  ScreenHeader,
  SearchBar,
  SegmentedControl,
  Toggle,
} from '@/components';
import { useToastStore } from '@/stores/toast-store';
import type { ThemeMode } from '@/stores/theme-store';
import type { IconType } from '@/components/icon-type';
import { usePreferencesStore } from '@/stores/preferences-store';
import { getBiometricAvailability, authenticate } from '@/lib/biometrics';
import {
  ensureNotificationPermission,
  enableDailySummary,
  disableDailySummary,
  isExpoGo,
} from '@/lib/notifications';
import { exportLocalBackup, formatRelativeBackup } from '@/lib/backup';
import { LANGUAGE_OPTIONS } from '@/lib/preference-options';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

interface NavRow {
  kind: 'nav';
  label: string;
  subtitle?: string;
  icon: IconType;
  onPress: () => void;
}
interface ToggleRow {
  kind: 'toggle';
  label: string;
  subtitle?: string;
  icon: IconType;
  value: boolean;
  onChange: (v: boolean) => void;
}
type Row = NavRow | ToggleRow;

export default function SettingsScreen() {
  const { colors, spacing, typography, mode, setMode } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const [query, setQuery] = useState('');
  const [backingUp, setBackingUp] = useState(false);

  const language = usePreferencesStore((s) => s.language);
  const timezone = usePreferencesStore((s) => s.timezone);
  const currency = usePreferencesStore((s) => s.currency);
  const biometricEnabled = usePreferencesStore((s) => s.biometricEnabled);
  const setBiometricEnabled = usePreferencesStore((s) => s.setBiometricEnabled);
  const notifications = usePreferencesStore((s) => s.notifications);
  const setNotificationPreference = usePreferencesStore((s) => s.setNotificationPreference);
  const lastBackupAt = usePreferencesStore((s) => s.lastBackupAt);
  const markBackedUp = usePreferencesStore((s) => s.markBackedUp);

  const languageLabel = LANGUAGE_OPTIONS.find((l) => l.code === language)?.label ?? language;

  const handleTaskReminders = async (next: boolean) => {
    if (next) {
      if (isExpoGo()) {
        showToast('Notifications need a development build — not available in Expo Go', 'danger');
        return;
      }
      const granted = await ensureNotificationPermission();
      if (!granted) {
        showToast('Enable notifications for Elara in system settings to use reminders', 'danger');
        return;
      }
    }
    setNotificationPreference('taskReminders', next);
  };

  const handleDailySummary = async (next: boolean) => {
    if (next) {
      if (isExpoGo()) {
        showToast('Notifications need a development build — not available in Expo Go', 'danger');
        return;
      }
      const ok = await enableDailySummary();
      if (!ok) {
        showToast('Enable notifications for Elara in system settings to use this', 'danger');
        return;
      }
    } else {
      await disableDailySummary();
    }
    setNotificationPreference('dailySummary', next);
  };

  const handleBiometricToggle = async (next: boolean) => {
    if (!next) {
      setBiometricEnabled(false);
      return;
    }
    const availability = await getBiometricAvailability();
    if (availability === 'no-hardware') {
      showToast("This device doesn't support Face ID or Touch ID", 'danger');
      return;
    }
    if (availability === 'not-enrolled') {
      showToast('Set up Face ID or Touch ID in your device settings first', 'danger');
      return;
    }
    const confirmed = await authenticate('Confirm to enable biometric login');
    if (confirmed) {
      setBiometricEnabled(true);
      showToast('Biometric login enabled', 'success');
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      await exportLocalBackup();
      markBackedUp();
    } catch {
      showToast("Couldn't export backup", 'danger');
    } finally {
      setBackingUp(false);
    }
  };

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Notifications',
      rows: [
        {
          kind: 'toggle',
          label: 'Task reminders',
          subtitle: 'Notify me when a task is due',
          icon: Bell,
          value: notifications.taskReminders,
          onChange: handleTaskReminders,
        },
        {
          kind: 'toggle',
          label: 'Event reminders',
          subtitle: 'Applies once Calendar syncs with your account',
          icon: Bell,
          value: notifications.eventReminders,
          onChange: (v) => setNotificationPreference('eventReminders', v),
        },
        {
          kind: 'toggle',
          label: 'Daily summary',
          subtitle: 'A reminder each morning at 8:00 AM',
          icon: Bell,
          value: notifications.dailySummary,
          onChange: handleDailySummary,
        },
      ],
    },
    {
      title: 'General',
      rows: [
        {
          kind: 'nav',
          label: 'Language',
          subtitle: languageLabel,
          icon: Globe,
          onPress: () => router.push('/(tabs)/more/settings/language'),
        },
        {
          kind: 'nav',
          label: 'Timezone',
          subtitle: timezone,
          icon: Globe,
          onPress: () => router.push('/(tabs)/more/settings/timezone'),
        },
        {
          kind: 'nav',
          label: 'Currency',
          subtitle: currency,
          icon: Wallet,
          onPress: () => router.push('/(tabs)/more/settings/currency'),
        },
      ],
    },
    {
      title: 'Security',
      rows: [
        {
          kind: 'toggle',
          label: 'Biometric login',
          subtitle: 'Require Face ID / Touch ID to open Elara',
          icon: Fingerprint,
          value: biometricEnabled,
          onChange: handleBiometricToggle,
        },
        {
          kind: 'nav',
          label: 'Change password',
          icon: Shield,
          onPress: () => router.push('/(tabs)/more/settings/change-password'),
        },
      ],
    },
    {
      title: 'Data',
      rows: [
        {
          kind: 'nav',
          label: backingUp ? 'Backing up…' : 'Backup',
          subtitle: formatRelativeBackup(lastBackupAt),
          icon: DatabaseBackup,
          onPress: handleBackup,
        },
        {
          kind: 'nav',
          label: 'Sync',
          subtitle: 'Tasks, events & expenses sync automatically when signed in',
          icon: Cloud,
          onPress: () => showToast('Notes and shopping lists stay on-device for now'),
        },
        {
          kind: 'nav',
          label: 'Data & Privacy',
          icon: Shield,
          onPress: () => router.push('/(tabs)/more/settings/data-privacy'),
        },
      ],
    },
    {
      title: 'About',
      rows: [
        {
          kind: 'nav',
          label: 'About Elara',
          icon: Info,
          onPress: () => router.push('/(tabs)/more/settings/about'),
        },
      ],
    },
  ];

  const filteredSections = sections
    .map((s) => ({
      ...s,
      rows: s.rows.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((s) => s.rows.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxl, gap: spacing.lg }}>
        <View style={{ paddingHorizontal: spacing.md }}>
          <ScreenHeader
            title="Settings"
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
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search settings" />
        </View>

        {query.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingHorizontal: spacing.xs,
              }}
            >
              <Palette size={14} color={colors.textSecondary} strokeWidth={1.75} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Appearance</Text>
            </View>
            <SegmentedControl options={THEME_OPTIONS} value={mode} onChange={setMode} />
          </View>
        ) : null}

        {filteredSections.map((section) => (
          <View key={section.title} style={{ gap: spacing.sm }}>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, paddingHorizontal: spacing.lg },
              ]}
            >
              {section.title}
            </Text>
            <View style={{ paddingHorizontal: spacing.md }}>
              <Card padded={false}>
                {section.rows.map((row) =>
                  row.kind === 'toggle' ? (
                    <ListItem
                      key={row.label}
                      title={row.label}
                      subtitle={row.subtitle}
                      leadingIcon={row.icon}
                      trailing={
                        <Toggle
                          value={row.value}
                          onValueChange={row.onChange}
                          accessibilityLabel={row.label}
                        />
                      }
                    />
                  ) : (
                    <ListItem
                      key={row.label}
                      title={row.label}
                      subtitle={row.subtitle}
                      leadingIcon={row.icon}
                      showChevron
                      onPress={row.onPress}
                    />
                  ),
                )}
              </Card>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
