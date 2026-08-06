import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetPasswordSchema, type ResetPasswordInput } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, TextInput } from '@/components';
import { authApi } from '@/features/auth/api';
import { ApiError } from '@/lib/api-client';

export default function ResetPasswordScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenParam ?? '', password: '' },
  });

  const onSubmit = async (input: ResetPasswordInput) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await authApi.resetPassword(input);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.xl,
          paddingTop: insets.top + spacing.xl,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.xxs }}>
          <Text style={[typography.screenTitle, { color: colors.text }]}>Set a new password</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Paste the reset link&apos;s token and choose a new password.
          </Text>
        </View>

        {done ? (
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.button,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Text style={[typography.body, { color: colors.text }]}>
              Your password has been updated. You can now log in.
            </Text>
            <Button label="Go to log in" onPress={() => router.replace('/(auth)/login')} />
          </View>
        ) : (
          <>
            {submitError ? (
              <View
                style={{
                  backgroundColor: colors.danger,
                  borderRadius: radius.button,
                  padding: spacing.sm,
                }}
              >
                <Text style={[typography.bodySmall, { color: colors.textInverse }]}>
                  {submitError}
                </Text>
              </View>
            ) : null}

            <View style={{ gap: spacing.md }}>
              <Controller
                control={control}
                name="token"
                render={({ field }) => (
                  <TextInput
                    label="Reset token"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.token?.message}
                    autoCapitalize="none"
                    multiline
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <TextInput
                    label="New password"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.password?.message}
                    isPassword
                    autoComplete="new-password"
                  />
                )}
              />
            </View>

            <Button
              label="Reset password"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              fullWidth
            />
          </>
        )}

        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace('/(auth)/login')}
          style={{ alignItems: 'center' }}
        >
          <Text style={[typography.bodySmall, { color: colors.primary }]}>Back to log in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
