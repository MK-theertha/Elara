import { forwardRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  Pressable,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { label, error, isPassword, secureTextEntry, ...inputProps },
  ref,
) {
  const { colors, spacing, radius, typography } = useTheme();
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={{ gap: spacing.xxs }}>
      {label ? <Text style={[typography.label, { color: colors.text }]}>{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.sm,
        }}
      >
        <RNTextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword ? !revealed : secureTextEntry}
          style={[
            typography.body,
            {
              flex: 1,
              color: colors.text,
              paddingVertical: spacing.sm,
              minHeight: 44,
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
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
});
