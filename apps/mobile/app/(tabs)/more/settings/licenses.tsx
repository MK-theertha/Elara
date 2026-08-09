import { FlatList, View, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { IconButton, ScreenHeader } from '@/components';

interface LicenseEntry {
  name: string;
  license: string;
}

const LIBRARIES: LicenseEntry[] = [
  { name: 'React', license: 'MIT' },
  { name: 'React Native', license: 'MIT' },
  { name: 'Expo', license: 'MIT' },
  { name: 'Expo Router', license: 'MIT' },
  { name: 'React Native Reanimated', license: 'MIT' },
  { name: 'React Native Gesture Handler', license: 'MIT' },
  { name: '@gorhom/bottom-sheet', license: 'MIT' },
  { name: 'React Native Draggable FlatList', license: 'MIT' },
  { name: 'React Native Gifted Charts', license: 'MIT' },
  { name: 'React Native SVG', license: 'MIT' },
  { name: 'Zustand', license: 'MIT' },
  { name: 'TanStack Query', license: 'MIT' },
  { name: 'React Hook Form', license: 'MIT' },
  { name: 'Zod', license: 'MIT' },
  { name: 'Lucide Icons', license: 'ISC' },
  { name: 'NestJS', license: 'MIT' },
  { name: 'Passport', license: 'MIT' },
  { name: 'bcrypt', license: 'MIT' },
  { name: 'Prisma', license: 'Apache-2.0' },
];

export default function LicensesScreen() {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Open Source Licenses"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <FlatList
        data={LIBRARIES}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs }}
        ListHeaderComponent={
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, marginBottom: spacing.md },
            ]}
          >
            Elara is built on these open source libraries. Thanks to their maintainers.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.sm,
              borderRadius: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing.xxs,
            }}
          >
            <Text style={[typography.body, { color: colors.text }]}>{item.name}</Text>
            <View
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: radius.chip,
                paddingHorizontal: spacing.xs,
                paddingVertical: 3,
              }}
            >
              <Text style={[typography.tinyLabel, { color: colors.textSecondary }]}>
                {item.license}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
