// Process-local in-memory cache. Resets on server restart/redeploy — good
// enough for smoothing out repeated identical searches within a dev/runtime
// session and staying under the HotPepper API's rate limits.
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs = 600_000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
