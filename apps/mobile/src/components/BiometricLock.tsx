import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Button } from './Button';
import { usePreferencesStore } from '@/stores/preferences-store';
import { authenticate } from '@/lib/biometrics';

/** Gates its children behind a Face ID / Touch ID prompt when the user has opted into
 * "Biometric login" in Settings. Re-locks whenever the app returns from background, not
 * just on cold start, so it behaves like a real app lock rather than a one-time gate.
 * Unlocking is user-initiated (a tap on "Unlock") rather than auto-prompted, so opening
 * the app never surprises the user with an unsolicited system dialog. */
export function BiometricLock({ children }: { children: ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  const enabled = usePreferencesStore((s) => s.biometricEnabled);
  const [unlocked, setUnlocked] = useState(!enabled);
  const [authenticating, setAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (enabled && appState.current === 'active' && /inactive|background/.test(next)) {
        setUnlocked(false);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [enabled]);

  const handleUnlock = async () => {
    setAuthenticating(true);
    try {
      const ok = await authenticate('Unlock Elara');
      if (ok) setUnlocked(true);
    } finally {
      setAuthenticating(false);
    }
  };

  // Turning the preference on mid-session doesn't yank the lock down immediately — it takes
  // effect from the next background/foreground cycle, so enabling it never locks you out of
  // the screen you just used to enable it.
  if (!enabled || unlocked) return <>{children}</>;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
      }}
    >
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: `${colors.primary}12`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldCheck size={32} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={[typography.sectionTitle, { color: colors.text }]}>Elara is locked</Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
        Unlock with Face ID or Touch ID to continue.
      </Text>
      <Button label="Unlock" onPress={handleUnlock} loading={authenticating} />
    </View>
  );
}
