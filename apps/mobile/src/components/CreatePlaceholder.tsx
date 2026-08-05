import { View } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { EmptyState } from './EmptyState';

export interface CreatePlaceholderProps {
  icon: keyof typeof Ionicons.glyphMap;
  resource: string;
}

export function CreatePlaceholder({ icon, resource }: CreatePlaceholderProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      <EmptyState
        icon={icon}
        title={`Creating a ${resource} is coming soon`}
        description="This form will be built when the corresponding feature phase lands."
      />
    </View>
  );
}
