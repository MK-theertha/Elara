import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Plus, ShoppingCart } from 'lucide-react-native';
import { formatCurrency } from '@elara/shared';
import { useTheme } from '@/theme/useTheme';
import { Checkbox, EmptyState, ErrorState, IconButton, TextInput } from '@/components';
import { categoryColors } from '@/theme/colors';
import { useShoppingStore } from '@/stores/shopping-store';
import { usePreferencesStore } from '@/stores/preferences-store';

export default function ShoppingListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { colors, spacing, typography } = useTheme();
  const currency = usePreferencesStore((s) => s.currency);
  const list = useShoppingStore((s) => s.lists.find((l) => l.id === listId));
  const togglePurchased = useShoppingStore((s) => s.togglePurchased);
  const addItem = useShoppingStore((s) => s.addItem);
  const [newItem, setNewItem] = useState('');

  if (!list) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'List', headerShown: true }} />
        <ErrorState title="List not found" onRetry={() => router.back()} />
      </View>
    );
  }

  const tint = categoryColors[list.color];
  const toBuy = list.items.filter((i) => !i.purchased);
  const purchased = list.items.filter((i) => i.purchased);
  const estimate = toBuy.reduce((sum, i) => sum + i.price, 0);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    addItem(list.id, newItem.trim(), '1', 0);
    setNewItem('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: list.name, headerShown: true }} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tint }} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{list.store}</Text>
          </View>
          <Text style={[typography.screenTitle, { color: colors.text }]}>{list.name}</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            Estimated total: {formatCurrency(estimate, currency)} · {toBuy.length} remaining
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add an item"
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
          </View>
          <IconButton
            icon={Plus}
            accessibilityLabel="Add item"
            variant="filled"
            onPress={handleAdd}
          />
        </View>

        {list.items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="List is empty"
            description="Add your first item above."
          />
        ) : (
          <>
            {toBuy.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>TO BUY</Text>
                {toBuy.map((item) => (
                  <View
                    key={item.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                  >
                    <Checkbox
                      checked={item.purchased}
                      onToggle={() => togglePurchased(list.id, item.id)}
                      color={tint}
                      accessibilityLabel={`Mark ${item.name} purchased`}
                    />
                    <Text style={[typography.body, { color: colors.text, flex: 1 }]}>
                      {item.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {item.quantity}
                    </Text>
                    {item.price > 0 ? (
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {formatCurrency(item.price, currency)}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {purchased.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>PURCHASED</Text>
                {purchased.map((item) => (
                  <View
                    key={item.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                  >
                    <Checkbox
                      checked={item.purchased}
                      onToggle={() => togglePurchased(list.id, item.id)}
                      color={tint}
                      accessibilityLabel={`Mark ${item.name} not purchased`}
                    />
                    <Text
                      style={[
                        typography.body,
                        { color: colors.textTertiary, textDecorationLine: 'line-through', flex: 1 },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
