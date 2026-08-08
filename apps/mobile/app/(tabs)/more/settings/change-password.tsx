import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, KeyRound } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Button, IconButton, ScreenHeader } from '@/components';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/features/auth/api';
import { ApiError } from '@/lib/api-client';

/** There's no "change password while logged in" endpoint on the API (only register/login/
 * forgot-password/reset-password) — so this reuses the real forgot-password flow with the
 * signed-in user's own email rather than fabricating a fake success state. */
export default function ChangePasswordScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!user?.email) return;
    setSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword({ email: user.email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingHorizontal: spacing.md, backgroundColor: colors.background }}>
        <ScreenHeader
          title="Change Password"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      >
        {sent ? (
          <View style={{ gap: spacing.sm, alignItems: 'center', paddingTop: spacing.xl }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: `${colors.success}12`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={28} color={colors.success} strokeWidth={1.75} />
            </View>
            <Text style={[typography.cardTitle, { color: colors.text, textAlign: 'center' }]}>
              Check your email
            </Text>
            <Text
              style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}
            >
              We sent a password reset link to {user?.email}. Follow it to set a new password.
            </Text>
            <Button label="Done" variant="secondary" onPress={() => router.back()} />
          </View>
        ) : (
          <>
            {error ? (
              <View
                style={{
                  backgroundColor: colors.danger,
                  borderRadius: radius.button,
                  padding: spacing.sm,
                }}
              >
                <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{error}</Text>
              </View>
            ) : null}
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              To change your password, we&apos;ll email a secure reset link to {user?.email}. Elara
              doesn&apos;t change passwords in-app to avoid ever handling your current password
              outside of login.
            </Text>
            <Button label="Send reset link" onPress={handleSend} loading={submitting} fullWidth />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
