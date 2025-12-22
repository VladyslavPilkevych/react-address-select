export type CacheEntry<T> = { value: T; expiresAt: number };

export const createTtlCache = <T>(ttlMs: number) => {
  const map = new Map<string, CacheEntry<T>>();

  const get = (key: string): T | undefined => {
    const hit = map.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      map.delete(key);
      return undefined;
    }
    return hit.value;
  };

  const set = (key: string, value: T) => {
    map.set(key, { value, expiresAt: Date.now() + ttlMs });
  };

  const clear = () => map.clear();

  return { get, set, clear };
};
