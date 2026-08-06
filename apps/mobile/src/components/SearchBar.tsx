import { View, TextInput as RNTextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: SearchBarProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.input,
        paddingHorizontal: spacing.sm + 2,
        height: 46,
      }}
    >
      <Search size={18} color={colors.textTertiary} strokeWidth={1.75} />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={placeholder}
        style={[typography.body, { flex: 1, color: colors.text }]}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          hitSlop={8}
        >
          <X size={16} color={colors.textTertiary} strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}
