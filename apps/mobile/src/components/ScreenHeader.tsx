import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface ScreenHeaderProps {
  title: string;
  accessory?: React.ReactNode;
}

export function ScreenHeader({ title, accessory }: ScreenHeaderProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
      }}
    >
      <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
      {accessory}
    </View>
  );
}
