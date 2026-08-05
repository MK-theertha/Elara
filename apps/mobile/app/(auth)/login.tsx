import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginSchema, type LoginInput } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, TextInput } from '@/components';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api-client';

export default function LoginScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (input: LoginInput) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { user, tokens } = await authApi.login(input);
      await setSession(user, tokens);
      router.replace('/(tabs)');
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
          <Text style={[typography.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Log in to continue to Elara.
          </Text>
        </View>

        {submitError ? (
          <View
            style={{
              backgroundColor: colors.danger,
              borderRadius: 10,
              padding: spacing.sm,
            }}
          >
            <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{submitError}</Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.md }}>
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
                testID="login-email"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextInput
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.password?.message}
                isPassword
                autoComplete="password"
                testID="login-password"
              />
            )}
          />
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/(auth)/forgot-password')}
            hitSlop={8}
          >
            <Text style={[typography.bodySmall, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>
        </View>

        <Button label="Log In" onPress={handleSubmit(onSubmit)} loading={submitting} fullWidth />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/(auth)/register')}
          style={{ alignItems: 'center' }}
        >
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Don&apos;t have an account? <Text style={{ color: colors.primary }}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
