import { Stack } from 'expo-router';
import { CreatePlaceholder } from '@/components';

export default function CreateNoteScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Note' }} />
      <CreatePlaceholder icon="document-text-outline" resource="note" />
    </>
  );
}
