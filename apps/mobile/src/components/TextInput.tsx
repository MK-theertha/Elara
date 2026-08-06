import { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  Pressable,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { motion } from '@/theme/animations';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { label, error, isPassword, secureTextEntry, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { colors, spacing, radius, typography } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const focusProgress = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error ? colors.danger : focusProgress.value > 0.5 ? colors.primary : colors.border,
  }));

  return (
    <View style={{ gap: spacing.xxs }}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderRadius: radius.input,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.sm + 2,
          },
          borderStyle,
        ]}
      >
        <RNTextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword ? !revealed : secureTextEntry}
          onFocus={(e) => {
            focusProgress.value = withTiming(1, motion.timing.fast);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focusProgress.value = withTiming(0, motion.timing.fast);
            onBlur?.(e);
          }}
          style={[
            typography.body,
            {
              flex: 1,
              color: colors.text,
              paddingVertical: spacing.sm + 2,
              minHeight: 48,
            },
          ]}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            onPress={() => setRevealed((v) => !v)}
            hitSlop={8}
          >
            {revealed ? (
              <EyeOff size={20} color={colors.textSecondary} strokeWidth={1.75} />
            ) : (
              <Eye size={20} color={colors.textSecondary} strokeWidth={1.75} />
            )}
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
});
