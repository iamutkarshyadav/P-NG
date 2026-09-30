/**
 * Turns a Supabase/PostgREST error (or anything thrown) into a safe, sanitized message to show the user.
 * Internal database syntax, table relations, and constraint names are masked to prevent information disclosure.
 */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const raw = (error as { message?: string; details?: string }).message ?? '';
  if (!raw) return fallback;

  // Network connection failures
  if (/network request failed|failed to fetch|fetch failed/i.test(raw)) {
    return 'No connection. Check your internet and try again.';
  }

  // Domain validation & check constraint mappings
  if (/profiles_lifestyle_values_check/i.test(raw)) {
    return 'One of the selected lifestyle attributes is invalid.';
  }
  if (/profiles_hometown_languages_check/i.test(raw)) {
    return 'Languages or hometown exceeds character limits.';
  }
  if (/Height must be between 90 and 250|profiles_height_cm_check/i.test(raw)) {
    return 'Please enter a valid height between 90 and 250 cm.';
  }
  if (/Select between 1 and 8 vibe tags|Pick between 1 and 8 tags/i.test(raw)) {
    return 'Please select between 1 and 8 vibe tags.';
  }
  if (/Unauthorized prompt photo storage path/i.test(raw)) {
    return 'Prompt photo verification failed. Please try re-attaching your photo.';
  }
  if (/Prompt question.*and answer.*required|Each prompt needs a question/i.test(raw)) {
    return 'Each prompt requires a question and an answer.';
  }
  if (/Name must be between 2 and 40 characters/i.test(raw)) {
    return 'Your name must be between 2 and 40 characters.';
  }
  if (/Bio must be between 1 and 500 characters/i.test(raw)) {
    return 'Please write a short bio about yourself (up to 500 characters).';
  }

  // Information disclosure protection: mask database syntax, relations, unique constraints, and schema details
  if (/syntax error|relation|column|duplicate key|violates|constraint|foreign key/i.test(raw)) {
    return fallback;
  }

  return raw;
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
