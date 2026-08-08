import { Alert, ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, FileText, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { Button, Card, IconButton, ScreenHeader, StatTile } from '@/components';
import { useToastStore } from '@/stores/toast-store';
import { getLocalDataCounts, clearLocalData } from '@/lib/backup';

export default function DataPrivacyScreen() {
  const { colors, spacing, typography } = useTheme();
  const showToast = useToastStore((s) => s.show);
  const counts = getLocalDataCounts();

  const handleClear = () => {
    Alert.alert(
      'Clear local data',
      'This permanently deletes every note and shopping list stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: () => {
            clearLocalData();
            showToast('Local data cleared', 'success');
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.md }}>
        <ScreenHeader
          title="Data & Privacy"
          accessory={
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel="Back"
              onPress={() => router.back()}
            />
          }
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>
            Stored on this device
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <StatTile label="Notes" value={counts.notes} icon={FileText} />
            <StatTile label="Shopping items" value={counts.shoppingItems} icon={ShoppingCart} />
          </View>
        </View>

        <Card>
          <Text style={[typography.cardTitle, { color: colors.text, marginBottom: spacing.xs }]}>
            How Elara handles your data
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Tasks, calendar events, and expenses sync with your account on Elara&apos;s servers.
            Notes and shopping lists currently live only on this device. Elara does not sell your
            data or share it with advertisers.
          </Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.text }]}>Danger zone</Text>
          <Button
            label="Clear local data"
            variant="danger"
            icon={Trash2}
            onPress={handleClear}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}
