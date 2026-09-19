import * as Location from 'expo-location';
import { setLocation } from './profile';

export type LocationResult =
  | { ok: true; city: string | null }
  | { ok: false; reason: 'denied' | 'unavailable' };

/** Asks for foreground permission, reads a position and stores it (the server coarsens it to ~1 km). */
export async function shareCurrentLocation(): Promise<LocationResult> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) return { ok: false, reason: 'denied' };
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    let city: string | null = null;
    try {
      const [place] = await Location.reverseGeocodeAsync(pos.coords);
      city = place?.city ?? place?.subregion ?? place?.region ?? null;
    } catch {
      // Reverse geocoding is best-effort; distance still works without a city name.
    }
    await setLocation(pos.coords.latitude, pos.coords.longitude, city ?? undefined);
    return { ok: true, city };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
