interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}
declare class SimpleCache {
    private cache;
    private readonly defaultTTL;
    set<T>(key: string, data: T, ttl?: number): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    size(): number;
    cleanup(): void;
}
export declare function createPSICacheKey(url: string, strategy: string, categories: string[], locale: string): string;
export declare function createCruxCacheKey(url: string, formFactor?: string): string;
export declare const cache: SimpleCache;
export type { CacheEntry };
