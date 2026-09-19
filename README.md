# P!NG

Neo-brutalist dating app: Expo SDK 57 / React Native, backed by Supabase (Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions).

> `AGENTS.md`: Expo has changed. Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before changing Expo code.

## Run it

```sh
npm install
cp .env.example .env.local      # already filled in for the dev project on this machine
npx expo start                  # press w for web
```

Native features that need a **development build** (Expo Go is not enough): push notifications, the Google sign-in redirect and the app lock.

```sh
npm i -g eas-cli
eas init                        # creates the EAS project id (needed for push tokens)
eas build --profile development --platform android   # or ios
```

Checks: `npm run typecheck`, and `npm run smoke` (live end-to-end test against the dev Supabase project).

## Test accounts (dev builds only)

| Account | How it behaves |
|---|---|
| **Alex** `alex@ping.app` / `password123` | Seeded, fully onboarded: 3 matches with chats, 9 people who liked him, feed of ~30 candidates. Tap **ALEX** on the login screen. |
| **Sam** `sam@ping.app` / `password123` | Recreated from scratch each time you tap **SAM**, so sign-up and all 8 onboarding steps run for real. After onboarding the seeded candidates are moved next to Sam's location and five of them like Sam. |

The quick-fill bar only renders when `__DEV__` and `EXPO_PUBLIC_ENABLE_DEV_LOGINS=true`.

## Architecture

```
app (Expo)  ── supabase-js ──>  Auth        email/password + Google OAuth (browser redirect)
                                Postgres    RLS on every table; other people are only reachable through RPCs
                                Storage     private profile-photos / selfies buckets, signed URLs
                                Realtime    messages + matches
                                Edge Fns    delete-account, notify-push, dev-reset-user (dev only)
```

- `src/lib`: env validation, Supabase client, palette/format helpers
- `src/services`: one module per domain (auth, profile, photos, tags, discover, chat, safety, push, account, location, appLock)
- `src/providers/SessionProvider.tsx`: session + profile; onboarding resumes from `profiles.onboarding_step`
- `src/hooks`: React Query hooks (photos, settings, signed URLs, inbox badges)
- `supabase/migrations`: the schema, applied in order. `supabase/seed-dev.sql`, `supabase/push-config.sql`, `supabase/reset-alex.sql`, `supabase/review-verification.sql` are run by hand (never as migrations).

Privacy model: the client only ever receives a distance bucket and an age for other people, never coordinates or birthdays. Exact locations are rounded to ~1 km before they are stored.

## Setting up a new Supabase project (e.g. production)

1. Create the project, then apply every file in `supabase/migrations` in order.
2. Run `supabase/push-config.sql` (replace `<project-ref>`), then deploy `supabase/functions/delete-account` (verify JWT on) and `notify-push` (verify JWT off; it authenticates with the shared secret).
3. **Do not** run `seed-dev.sql` or deploy `dev-reset-user` on production. Their gate (`app_config.dev_tools_enabled`) simply does not exist there.
4. Auth settings (dashboard > Authentication): keep **Confirm email** on for production, set a minimum password length of 8, and add these redirect URLs: `ping://auth-callback`, your web origin, and the `exp://…` URL Expo prints while developing.
5. Set `EXPO_PUBLIC_ENABLE_DEV_LOGINS=false` (or leave it out) for production builds.

## Things only you can do

1. **Google sign-in**: Google Cloud Console > Credentials > create an OAuth client of type *Web*. In Supabase > Authentication > Providers > Google, paste its client ID and secret and enable it. (Google's redirect URI is Supabase's `https://<ref>.supabase.co/auth/v1/callback`.)
2. **Push notifications**: `eas init`, upload FCM v1 credentials for Android and an APNs key for iOS through `eas credentials`. Optionally create an Expo access token.
3. **Store review**: Apple requires "Sign in with Apple" whenever another social login is offered on iOS.
4. **Selfie verification** is a manual queue: see `supabase/review-verification.sql`.
5. **Legal pages**: set `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_URL`; the links appear in Settings.
6. Change `com.utkarsh.ping` in `app.json` (iOS bundle id / Android package) before the first store build.
