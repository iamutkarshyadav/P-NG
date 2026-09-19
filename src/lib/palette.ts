/** Deterministic colours for the illustrated fallback avatar, so a person always looks the same. */
export interface AvatarPalette {
  jacket: string;
  bgFrom: string;
  bgTo: string;
  hair: string;
  flat: string;
}

const PALETTES: AvatarPalette[] = [
  { jacket: '#FFE600', bgFrom: '#E51760', bgTo: '#BE185D', hair: '#111827', flat: '#FBCFE8' },
  { jacket: '#38BDF8', bgFrom: '#4F46E5', bgTo: '#312E81', hair: '#7C2D12', flat: '#C7D2FE' },
  { jacket: '#F43F5E', bgFrom: '#F59E0B', bgTo: '#B45309', hair: '#171717', flat: '#FDE68A' },
  { jacket: '#A3E635', bgFrom: '#0D9488', bgTo: '#115E59', hair: '#3F3F46', flat: '#99F6E4' },
  { jacket: '#FB923C', bgFrom: '#7C3AED', bgTo: '#4C1D95', hair: '#0F172A', flat: '#DDD6FE' },
];

export function paletteFor(id: string): AvatarPalette {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}
