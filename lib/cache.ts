// Simple in-memory cache with TTL
interface CacheEntry<T> {
    data: T;
    expires: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T, ttlSeconds: number): void {
        this.cache.set(key, {
            data,
            expires: Date.now() + (ttlSeconds * 1000),
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const [key] of this.cache) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

export const cache = new SimpleCache();
