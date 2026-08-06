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
  const [taskReminders, setTaskReminders] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const notImplemented = (label: string) => showToast(`${label} is coming in a later phase`);

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'Notifications',
      rows: [
        {
          kind: 'toggle',
          label: 'Task reminders',
          icon: Bell,
          value: taskReminders,
          onChange: setTaskReminders,
        },
        {
          kind: 'toggle',
          label: 'Event reminders',
          icon: Bell,
          value: eventReminders,
          onChange: setEventReminders,
        },
        {
          kind: 'toggle',
          label: 'Daily summary',
          icon: Bell,
          value: dailySummary,
          onChange: setDailySummary,
        },
      ],
    },
    {
      title: 'General',
      rows: [
        {
          kind: 'nav',
          label: 'Language',
          subtitle: 'English',
          icon: Globe,
          onPress: () => notImplemented('Language'),
        },
        {
          kind: 'nav',
          label: 'Timezone',
          subtitle: 'Automatic',
          icon: Globe,
          onPress: () => notImplemented('Timezone'),
        },
        {
          kind: 'nav',
          label: 'Currency',
          subtitle: 'USD',
          icon: Wallet,
          onPress: () => notImplemented('Currency'),
        },
      ],
    },
    {
      title: 'Security',
      rows: [
        {
          kind: 'toggle',
          label: 'Biometric login',
          icon: Fingerprint,
          value: biometrics,
          onChange: setBiometrics,
        },
        {
          kind: 'nav',
          label: 'Change password',
          icon: Shield,
          onPress: () => notImplemented('Change password'),
        },
      ],
    },
    {
      title: 'Data',
      rows: [
        {
          kind: 'nav',
          label: 'Backup',
          subtitle: 'Last backup: never',
          icon: DatabaseBackup,
          onPress: () => notImplemented('Backup'),
        },
        {
          kind: 'nav',
          label: 'Sync',
          subtitle: 'Off',
          icon: Cloud,
          onPress: () => notImplemented('Sync'),
        },
        {
          kind: 'nav',
          label: 'Data & Privacy',
          icon: Shield,
          onPress: () => notImplemented('Data & Privacy'),
        },
      ],
    },
    {
      title: 'About',
      rows: [
        {
          kind: 'nav',
          label: 'About Elara',
          subtitle: 'v1.0.0',
          icon: Info,
          onPress: () => notImplemented('About Elara'),
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
