const SIGNS: Array<[number, number, string]> = [
  [1, 20, 'Aquarius'], [2, 19, 'Pisces'], [3, 21, 'Aries'], [4, 20, 'Taurus'],
  [5, 21, 'Gemini'], [6, 21, 'Cancer'], [7, 23, 'Leo'], [8, 23, 'Virgo'],
  [9, 23, 'Libra'], [10, 23, 'Scorpio'], [11, 22, 'Sagittarius'], [12, 22, 'Capricorn'],
];

/** Mirrors public.zodiac_sign() in the database. `iso` is YYYY-MM-DD. */
export function zodiacFromIso(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  let sign = 'Capricorn';
  for (const [month, day, name] of SIGNS) {
    if (m > month || (m === month && d >= day)) sign = name;
  }
  return sign;
}

/** Mirrors public.age_years(). `iso` is YYYY-MM-DD. */
export function ageFromIso(iso: string, today: Date = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}
