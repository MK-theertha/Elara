import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { registerSchema } from '@elara/validation';
import { useTheme } from '@/theme/useTheme';
import { Button, TextInput } from '@/components';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/stores/auth-store';
import { ApiError } from '@/lib/api-client';

const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string().min(1, 'Confirm your password') })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export default function RegisterScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', name: '' },
  });

  const onSubmit = async (input: RegisterFormInput) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { user, tokens } = await authApi.register({
        email: input.email,
        password: input.password,
        name: input.name,
      });
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
          <Text style={[typography.screenTitle, { color: colors.text }]}>Create your account</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Start organizing your life with Elara.
          </Text>
        </View>

        {submitError ? (
          <View
            style={{
              backgroundColor: colors.danger,
              borderRadius: radius.button,
              padding: spacing.sm,
            }}
          >
            <Text style={[typography.bodySmall, { color: colors.textInverse }]}>{submitError}</Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.md }}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                label="Name (optional)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.name?.message}
                autoComplete="name"
              />
            )}
          />
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
                autoComplete="new-password"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextInput
                label="Confirm password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={errors.confirmPassword?.message}
                isPassword
                autoComplete="new-password"
              />
            )}
          />
        </View>

        <Button label="Sign Up" onPress={handleSubmit(onSubmit)} loading={submitting} fullWidth />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/(auth)/login')}
          style={{ alignItems: 'center' }}
        >
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Already have an account? <Text style={{ color: colors.primary }}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
