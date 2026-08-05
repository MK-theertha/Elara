import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, type ColorValue } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { QuickActionFab } from '@/components/QuickActionFab';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={24} color={color as string} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
        />
        <Tabs.Screen
          name="tasks/index"
          options={{ title: 'Tasks', tabBarIcon: tabIcon('checkbox', 'checkbox-outline') }}
        />
        <Tabs.Screen
          name="calendar/index"
          options={{ title: 'Calendar', tabBarIcon: tabIcon('calendar', 'calendar-outline') }}
        />
        <Tabs.Screen
          name="expenses/index"
          options={{ title: 'Expenses', tabBarIcon: tabIcon('cash', 'cash-outline') }}
        />
        <Tabs.Screen
          name="more/index"
          options={{ title: 'More', tabBarIcon: tabIcon('grid', 'grid-outline') }}
        />
      </Tabs>
      <QuickActionFab />
    </View>
  );
}
