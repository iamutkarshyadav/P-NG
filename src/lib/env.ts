// Every EXPO_PUBLIC_* variable must be referenced statically as process.env.EXPO_PUBLIC_X
// so Expo can inline it. These values ship in the app bundle: never put secrets here.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy .env.example to .env.local, fill it in, then restart with `npx expo start --clear`.'
  );
}

export const env = {
  supabaseUrl,
  supabasePublishableKey,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || undefined,
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL || undefined,
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || undefined,
} as const;
