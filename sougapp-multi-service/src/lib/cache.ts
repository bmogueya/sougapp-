interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 30000): void {
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.startsWith(pattern)) store.delete(key);
  }
}
