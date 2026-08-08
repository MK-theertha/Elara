import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Plus, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import {
  AnimatedPressable,
  AppModal,
  Button,
  EmptyState,
  FloatingButton,
  IconButton,
  ScreenHeader,
  TextInput,
} from '@/components';
import { ShoppingCard } from '@/components/cards';
import { categoryColors, type CategoryColorKey } from '@/theme/colors';
import { useShoppingStore } from '@/stores/shopping-store';

const COLOR_OPTIONS: CategoryColorKey[] = ['blue', 'green', 'violet', 'amber', 'pink', 'teal'];

export default function ShoppingListsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const lists = useShoppingStore((s) => s.lists);
  const addList = useShoppingStore((s) => s.addList);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [color, setColor] = useState<CategoryColorKey>('blue');

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = addList(name.trim(), store.trim() || 'Any store', color);
    setName('');
    setStore('');
    setModalVisible(false);
    router.push(`/(tabs)/more/shopping/${id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader
        title="Shopping Lists"
        accessory={
          <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={() => router.back()} />
        }
      />
      {lists.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No shopping lists yet"
          description="Create a list to start tracking what you need to buy."
          actionLabel="New list"
          onActionPress={() => setModalVisible(true)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.md,
            gap: spacing.sm,
            paddingBottom: insets.bottom + 140,
          }}
        >
          {lists.map((list) => (
            <ShoppingCard
              key={list.id}
              name={list.name}
              store={list.store}
              color={list.color}
              purchasedCount={list.items.filter((i) => i.purchased).length}
              totalCount={list.items.length}
              estimate={list.items.reduce((sum, i) => sum + i.price, 0)}
              onPress={() => router.push(`/(tabs)/more/shopping/${list.id}`)}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ position: 'absolute', right: spacing.md, bottom: insets.bottom + 100 }}>
        <FloatingButton
          icon={Plus}
          accessibilityLabel="New shopping list"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <AppModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={{ gap: spacing.md }}>
          <TextInput label="List name" value={name} onChangeText={setName} autoFocus />
          <TextInput label="Store (optional)" value={store} onChangeText={setStore} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {COLOR_OPTIONS.map((c) => (
              <AnimatedPressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`${c} color`}
                accessibilityState={{ selected: color === c }}
                onPress={() => setColor(c)}
                scaleTo={0.85}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: categoryColors[c],
                  borderWidth: color === c ? 3 : 0,
                  borderColor: colors.surface,
                }}
              />
            ))}
          </View>
          <Button label="Create List" onPress={handleCreate} fullWidth />
        </View>
      </AppModal>
    </View>
  );
}
