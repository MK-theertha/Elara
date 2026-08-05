import { Stack } from 'expo-router';
import { CreatePlaceholder } from '@/components';

export default function CreateEventScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Event' }} />
      <CreatePlaceholder icon="calendar-outline" resource="event" />
    </>
  );
}
