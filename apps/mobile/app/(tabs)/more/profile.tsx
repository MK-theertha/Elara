import { ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  ChevronLeft,
  Cloud,
  DatabaseBackup,
  Flame,
  Shield,
  Target,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import {
  Avatar,
  Card,
  IconButton,
  ListItem,
  ScreenHeader,
  Section,
  SegmentedControl,
  StatTile,
} from '@/components';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { tasksApi } from '@/features/tasks/api';
import type { ThemeMode } from '@/stores/theme-store';

const ACHIEVEMENTS = [
  { icon: Flame, label: '7-day streak', unlocked: true, color: '#FF9F0A' },
  { icon: Target, label: '50 tasks done', unlocked: true, color: '#30D158' },
  { icon: Zap, label: 'Early bird', unlocked: true, color: '#5B5FEF' },
  { icon: Award, label: 'Power user', unlocked: false, color: '#7B61FF' },
];

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function ProfileScreen() {
  const { colors, spacing, radius, typography, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);

  const { data: completedTasks } = useQuery({
    queryKey: ['tasks', 'Completed'],
    queryFn: () => tasksApi.list({ view: 'completed' }),
  });

  const notImplemented = (label: string) => showToast(`${label} is coming in a later phase`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 140,
          gap: spacing.lg,
        }}
      >
        <View style={{ paddingHorizontal: spacing.md }}>
          <ScreenHeader
            title="Profile"
            accessory={
              <IconButton
                icon={ChevronLeft}
                accessibilityLabel="Back"
                onPress={() => router.back()}
              />
            }
          />
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Avatar name={user?.name ?? user?.email ?? 'You'} size={88} ring />
          <Text style={[typography.screenTitle, { color: colors.text }]}>
            {user?.name ?? 'Welcome'}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          }}
        >
          <StatTile label="Tasks completed" value={completedTasks?.length ?? 0} icon={Target} />
          <StatTile label="Day streak" value={7} icon={Flame} tint={colors.warning} />
        </View>

        <Section title="Achievements">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
          >
            {ACHIEVEMENTS.map((a) => (
              <View
                key={a.label}
                style={{
                  width: 96,
                  alignItems: 'center',
                  gap: spacing.xs,
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.sm,
                  opacity: a.unlocked ? 1 : 0.4,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.button,
                    backgroundColor: `${a.color}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <a.icon size={20} color={a.color} strokeWidth={1.75} />
                </View>
                <Text
                  style={[typography.caption, { color: colors.text, textAlign: 'center' }]}
                  numberOfLines={2}
                >
                  {a.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Section>

        <Section title="Appearance">
          <View style={{ paddingHorizontal: spacing.md }}>
            <SegmentedControl options={THEME_OPTIONS} value={mode} onChange={setMode} />
          </View>
        </Section>

        <Section title="Data">
          <View style={{ paddingHorizontal: spacing.md }}>
            <Card padded={false}>
              <ListItem
                title="Backup"
                subtitle="Last backup: never"
                leadingIcon={DatabaseBackup}
                showChevron
                onPress={() => notImplemented('Backup')}
              />
              <ListItem
                title="Sync"
                subtitle="Off"
                leadingIcon={Cloud}
                showChevron
                onPress={() => notImplemented('Sync')}
              />
              <ListItem
                title="Security"
                subtitle="Password, biometrics"
                leadingIcon={Shield}
                showChevron
                onPress={() => notImplemented('Security')}
              />
            </Card>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
