import { getLogger } from "./logger.js";
const logger = getLogger();
class SimpleCache {
    cache = new Map();
    defaultTTL = 5 * 60 * 1000; // 5 minutes
    set(key, data, ttl = this.defaultTTL) {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl,
        });
        logger.debug({ key, ttl }, "Cache entry stored");
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            logger.debug({ key }, "Cache miss");
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            logger.debug({ key }, "Cache entry expired");
            return null;
        }
        logger.debug({ key }, "Cache hit");
        return entry.data;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
        logger.debug("Cache cleared");
    }
    size() {
        return this.cache.size;
    }
    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            logger.debug({ removed }, "Cleaned up expired cache entries");
        }
    }
}
// Create cache key for PageSpeed Insights
export function createPSICacheKey(url, strategy, categories, locale) {
    return `psi:${url}:${strategy}:${categories.sort().join(',')}:${locale}`;
}
// Create cache key for CrUX data  
export function createCruxCacheKey(url, formFactor) {
    return `crux:${url}:${formFactor || 'default'}`;
}
// Singleton cache instance
export const cache = new SimpleCache();
// Cleanup interval (every 10 minutes)
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);
//# sourceMappingURL=cache.js.map