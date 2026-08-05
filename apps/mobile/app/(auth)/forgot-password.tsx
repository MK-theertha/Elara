import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, TextInput } from '@/components';
import { authApi } from '@/features/auth/api';

export default function ForgotPasswordScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (input: ForgotPasswordInput) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(input);
    } finally {
      // Always show the same confirmation, matching the API's no-enumeration
      // behavior — whether or not the email exists, the UI looks identical.
      setSubmitting(false);
      setSent(true);
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
          <Text style={[typography.title, { color: colors.text }]}>Reset your password</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </Text>
        </View>

        {sent ? (
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderRadius: 10,
              padding: spacing.md,
            }}
          >
            <Text style={[typography.body, { color: colors.text }]}>
              If an account exists for that email, a reset link is on its way.
            </Text>
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextInput
                  label="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                />
              )}
            />
            <Button
              label="Send reset link"
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
