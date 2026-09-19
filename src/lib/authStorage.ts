// Native: sessions persist in expo-sqlite's localStorage polyfill (per the Expo Supabase guide).
import 'expo-sqlite/localStorage/install';

export const authStorage: Storage = globalThis.localStorage;
