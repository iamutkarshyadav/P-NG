export function distanceLabel(km: number | null | undefined): string | null {
  if (km === null || km === undefined) return null;
  return km <= 1 ? 'UNDER 1 KM' : `${km} KM AWAY`;
}

export function activeLabel(iso: string | null | undefined, now: number = Date.now()): string | null {
  if (!iso) return null;
  const minutes = (now - new Date(iso).getTime()) / 60_000;
  if (minutes < 5) return 'ACTIVE NOW';
  if (minutes < 60 * 24) return 'ACTIVE TODAY';
  if (minutes < 60 * 24 * 7) return 'ACTIVE THIS WEEK';
  return null;
}

export function clockTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}

/** "2m", "3h", "5d" for list rows. */
export function relativeShort(iso: string, now: number = Date.now()): string {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d`;
}
