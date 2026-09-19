/** Turns a Supabase/PostgREST error (or anything thrown) into a message safe to show the user. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const message = (error as { message?: string }).message;
  if (!message) return fallback;
  if (/network request failed|failed to fetch|fetch failed/i.test(message)) {
    return 'No connection. Check your internet and try again.';
  }
  return message;
}

/** Returns the data, or throws a plain Error carrying a user-facing message. */
export function unwrap<T>(result: {
  data: T;
  error: { message: string } | null;
}): NonNullable<T> {
  if (result.error) throw new Error(errorMessage(result.error));
  if (result.data === null || result.data === undefined) {
    throw new Error('Nothing was returned. Please try again.');
  }
  return result.data as NonNullable<T>;
}

export function assertOk(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(errorMessage(result.error));
}
