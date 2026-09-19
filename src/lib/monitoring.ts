import * as Sentry from '@sentry/react-native';
import { env } from './env';

let enabled = false;

/** Starts crash reporting when EXPO_PUBLIC_SENTRY_DSN is set; otherwise everything here is a no-op. */
export function initMonitoring(): void {
  if (!env.sentryDsn || enabled) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    // Never send personal data; the user is identified by an opaque id only.
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
  enabled = true;
}

export function setMonitoringUser(userId: string | null): void {
  if (!enabled) return;
  Sentry.setUser(userId ? { id: userId } : null);
}

export function reportError(error: unknown, context?: string): void {
  if (!enabled) return;
  Sentry.captureException(error, context ? { tags: { context } } : undefined);
}

/** Wraps the root component so native crashes and unhandled promise rejections are captured. */
export function withMonitoring<P extends Record<string, unknown>>(Component: React.ComponentType<P>): React.ComponentType<P> {
  return env.sentryDsn ? (Sentry.wrap(Component) as React.ComponentType<P>) : Component;
}
