import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// The lock preference lives on the device only (it protects this device, not the account).
const LOCK_KEY = 'ping.appLockEnabled';

export async function isLockSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hardware && enrolled;
}

export async function isLockEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (await SecureStore.getItemAsync(LOCK_KEY)) === '1';
  } catch {
    return false;
  }
}

/** Turning the lock on requires a successful biometric/passcode check first. */
export async function setLockEnabled(enabled: boolean): Promise<boolean> {
  if (enabled) {
    if (!(await isLockSupported())) return false;
    const ok = await authenticate('Confirm to turn on the P!NG app lock');
    if (!ok) return false;
  }
  await SecureStore.setItemAsync(LOCK_KEY, enabled ? '1' : '0');
  return true;
}

export async function authenticate(prompt = 'Unlock P!NG'): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: prompt,
    fallbackLabel: 'Use passcode',
  });
  return result.success;
}
