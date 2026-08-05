import { Stack } from 'expo-router';
import { CreatePlaceholder } from '@/components';

export default function CreateExpenseScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Expense' }} />
      <CreatePlaceholder icon="cash-outline" resource="expense" />
    </>
  );
}
