import { Stack } from 'expo-router';
import { CreatePlaceholder } from '@/components';

export default function CreateTaskScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Task' }} />
      <CreatePlaceholder icon="checkbox-outline" resource="task" />
    </>
  );
}
