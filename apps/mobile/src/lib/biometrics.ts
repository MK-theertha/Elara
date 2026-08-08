import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricAvailability = 'available' | 'no-hardware' | 'not-enrolled';

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return 'no-hardware';
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return 'not-enrolled';
  return 'available';
}

export async function authenticate(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}
