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

Checks: `npm run typecheck`.

## Testing

The app ships with no seeded or demo accounts. Create test accounts through the normal sign-up flow (two accounts of different genders that match each other's preferences are enough to exercise Discover, Likes, Matches and Chat). Until at least one other onboarded profile exists, Discover shows its empty state.

## Architecture

```
app (Expo)  ── supabase-js ──>  Auth        email/password + Google OAuth (browser redirect)
                                Postgres    RLS on every table; other people are only reachable through RPCs
                                Storage     private profile-photos / selfies buckets, signed URLs
                                Realtime    messages + matches
                                Edge Fns    delete-account, notify-push
```

- `src/lib`: env validation, Supabase client, palette/format helpers
- `src/services`: one module per domain (auth, profile, photos, tags, discover, chat, safety, push, account, location, appLock)
- `src/providers/SessionProvider.tsx`: session + profile; onboarding resumes from `profiles.onboarding_step`
- `src/hooks`: React Query hooks (photos, settings, signed URLs, inbox badges)
- `supabase/migrations`: the schema, applied in order. `supabase/push-config.sql`, `supabase/review-verification.sql` and `supabase/review-reports.sql` are run by hand (never as migrations). Nothing in this repo creates accounts or demo data.

Privacy model: the client only ever receives a distance bucket and an age for other people, never coordinates or birthdays. Exact locations are rounded to ~1 km before they are stored.

## Setting up a new Supabase project (e.g. production)

1. Create the project, then apply every file in `supabase/migrations` in order.
2. Run `supabase/push-config.sql` (replace `<project-ref>`), then deploy `supabase/functions/delete-account` (verify JWT on) and `notify-push` (verify JWT off; it authenticates with the shared secret).
3. Auth settings (dashboard > Authentication): keep **Confirm email** on for production, set a minimum password length of 8, and add these redirect URLs: `ping://auth-callback`, your web origin, and the `exp://…` URL Expo prints while developing.

## Things only you can do

1. **Google sign-in**: Google Cloud Console > Credentials > create an OAuth client of type *Web*. In Supabase > Authentication > Providers > Google, paste its client ID and secret and enable it. (Google's redirect URI is Supabase's `https://<ref>.supabase.co/auth/v1/callback`.)
2. **Push notifications**: `eas init`, upload FCM v1 credentials for Android and an APNs key for iOS through `eas credentials`. Optionally create an Expo access token.
3. **Store review**: Apple requires "Sign in with Apple" whenever another social login is offered on iOS.
4. **Selfie verification** is a manual queue: see `supabase/review-verification.sql`.
5. **Legal pages**: set `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_URL`; the links appear in Settings.
6. Change `com.utkarsh.ping` in `app.json` (iOS bundle id / Android package) before the first store build.

## Private beta checklist

**Auth email links.** Supabase dashboard > Authentication > URL Configuration: set *Site URL* to your web origin and add these *Redirect URLs*: `ping://auth-callback`, your web origin, and the `exp://.../--/auth-callback` URL Expo prints in development. Confirmation and password-reset emails send people back into the app through these. The app handles the links in `SessionProvider` (helpers in `src/services/authLinks.ts`) and shows `ResetPasswordScreen` after a reset link.

**Crash reporting.** Create a Sentry React Native project and put its DSN in `EXPO_PUBLIC_SENTRY_DSN`. Without it reporting is off. For readable native stack traces run the Sentry wizard once (`npx @sentry/wizard -i reactNative`).

**Feedback.** Testers use Settings > Beta feedback. Read it in the SQL editor:

```sql
select f.created_at, f.category, p.display_name, f.message, f.app_version, f.platform
  from public.feedback f join public.profiles p on p.id = f.user_id
 order by f.created_at desc;
```

**Builds and over-the-air fixes.** Run `eas init`, then `eas update:configure` (writes the updates URL and runtime version into `app.json`). Build with `eas build --profile preview` and share the install link. Ship JavaScript-only fixes with `eas update --channel preview --message "what changed"`.
