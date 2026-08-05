import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const { colors, typography } = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[typography.label, { color: colors.onPrimary, fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
