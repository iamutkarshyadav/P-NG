import { useQuery } from '@tanstack/react-query';
import { signedUrls } from '../services/photos';

/** Signed URLs for storage paths (keyed by path). Cached for most of the URL lifetime. */
export function useSignedUrls(paths: string[]): Record<string, string> {
  const unique = Array.from(new Set(paths.filter(Boolean))).sort();
  const query = useQuery({
    queryKey: ['signed-urls', unique.join('|')],
    queryFn: () => signedUrls(unique),
    enabled: unique.length > 0,
    staleTime: 40 * 60_000,
  });
  return query.data ?? {};
}
