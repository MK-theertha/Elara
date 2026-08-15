import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/useTheme';

export interface AvatarProps {
  name: string;
  imageUri?: string;
  size?: number;
  ring?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, imageUri, size = 40, ring = false }: AvatarProps) {
  const { colors } = useTheme();

  const ringStyle = ring ? { borderWidth: 3, borderColor: colors.surface, padding: 0 } : null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ringStyle,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          recyclingKey={imageUri}
          cachePolicy="memory-disk"
        />
      ) : (
        <Text
          style={{
            color: colors.onPrimary,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: size * 0.4,
          }}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
