import { ScrollView, View, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarClock, Mic, Sparkles, StickyNote, Wallet, X } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { GradientBackground, IconButton } from '@/components';
import { useToastStore } from '@/stores/toast-store';
import type { IconType } from '@/components/icon-type';

const CAPABILITIES: { icon: IconType; title: string; description: string }[] = [
  {
    icon: CalendarClock,
    title: 'Plan my day',
    description: 'Auto-schedule tasks around your calendar',
  },
  {
    icon: StickyNote,
    title: 'Summarize notes',
    description: 'Turn long notes into quick takeaways',
  },
  { icon: Wallet, title: 'Track spending', description: 'Spot trends and flag unusual expenses' },
  {
    icon: Sparkles,
    title: 'Smart reminders',
    description: 'Nudge you at the right moment, not just a time',
  },
];

export default function AiScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.show);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      <View style={{ height: 320, overflow: 'hidden' }}>
        <GradientBackground style={{ flex: 1, paddingTop: insets.top }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'rgba(255,255,255,0.10)',
              top: -60,
              right: -50,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(255,255,255,0.08)',
              top: 120,
              left: -40,
            }}
          />

          <View
            style={{
              paddingHorizontal: spacing.md,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <IconButton
              icon={X}
              accessibilityLabel="Close"
              color="#FFFFFF"
              variant="filled"
              onPress={() => router.back()}
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.xl,
            }}
          >
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: 'rgba(255,255,255,0.16)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={34} color="#FFFFFF" strokeWidth={1.5} />
            </View>
            <Text style={[typography.screenTitle, { color: '#FFFFFF', textAlign: 'center' }]}>
              Meet your AI Assistant
            </Text>
            <Text
              style={[
                typography.bodySmall,
                { color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
              ]}
            >
              A calm, capable helper for your day — coming soon.
            </Text>
          </View>
        </GradientBackground>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.md,
          gap: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>What it&apos;ll do</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {CAPABILITIES.map((c) => (
              <View
                key={c.title}
                style={{
                  width: '47%',
                  gap: 6,
                  backgroundColor: colors.surface,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.sm + 2,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.button,
                    backgroundColor: `${colors.primary}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <c.icon size={16} color={colors.primary} strokeWidth={1.75} />
                </View>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{c.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {c.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>A preview</Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                alignSelf: 'flex-end',
                maxWidth: '80%',
                backgroundColor: colors.primary,
                borderRadius: radius.button,
                borderBottomRightRadius: 4,
                padding: spacing.sm,
              }}
            >
              <Text style={[typography.bodySmall, { color: colors.onPrimary }]}>
                What&apos;s on my plate today?
              </Text>
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                maxWidth: '85%',
                backgroundColor: colors.backgroundSecondary,
                borderRadius: radius.button,
                borderBottomLeftRadius: 4,
                padding: spacing.sm,
              }}
            >
              <Text style={[typography.bodySmall, { color: colors.text }]}>
                You&apos;ve got 3 tasks due today and a design review at 9:30. Want me to move your
                gym session to tomorrow?
              </Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md }}>
          <IconButton
            icon={Mic}
            accessibilityLabel="Voice input (coming soon)"
            size={26}
            variant="filled"
            color={colors.primary}
            onPress={() => showToast('Voice input is coming soon')}
          />
          <Text style={[typography.caption, { color: colors.textTertiary }]}>
            Tap to try voice — coming soon
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
