import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { QuickActionFab } from '@/components/QuickActionFab';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="tasks/index" options={{ title: 'Tasks' }} />
        <Tabs.Screen name="calendar/index" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="expenses/index" options={{ title: 'Expenses' }} />
        <Tabs.Screen name="more/index" options={{ title: 'More' }} />
      </Tabs>
      <FloatingTabBar />
      <QuickActionFab />
    </View>
  );
}
