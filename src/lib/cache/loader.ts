import DataLoader from "dataloader";
import { getRedisClient } from "@/lib/redis";

export interface CachedLoaderOptions<K extends string | number, V> {
  /** Cache key prefix (e.g., 'task' -> 'task:<id>') */
  prefix: string;
  /** Cache expiration time in seconds. Defaults to 3600 (1 hour). */
  ttl?: number;
  /** Batch query function resolving missing keys from the primary database */
  batchFetch: (keys: readonly K[]) => Promise<Map<K, V> | Record<string, V>>;
}

/**
 * Creates a DataLoader with Redis L2 caching.
 * Resolves keys from Redis multi-get first, batch-queries missing records from the database,
 * and backfills Redis using a pipelined batch write.
 */
export function createCachedLoader<K extends string | number, V>(
  options: CachedLoaderOptions<K, V>
): DataLoader<K, V | null> {
  const { prefix, ttl = 3600, batchFetch } = options;
  const redis = getRedisClient();

  return new DataLoader<K, V | null>(async (keys) => {
    const redisKeys = keys.map((k) => `${prefix}:${k}`);
    const results: (V | null)[] = new Array(keys.length).fill(null);
    const missingKeys: K[] = [];
    const missingIndices: number[] = [];

    // Attempt L2 cache retrieval
    try {
      if (redis.status === "ready" || redis.status === "connecting") {
        const cachedValues = await redis.mget(...redisKeys);
        for (let i = 0; i < keys.length; i++) {
          const raw = cachedValues[i];
          if (raw) {
            results[i] = JSON.parse(raw);
          } else {
            missingKeys.push(keys[i] as K);
            missingIndices.push(i);
          }
        }
      } else {
        missingKeys.push(...keys);
        missingIndices.push(...keys.map((_, i) => i));
      }
    } catch {
      missingKeys.push(...keys);
      missingIndices.push(...keys.map((_, i) => i));
    }

    // Batch query missing records from database
    if (missingKeys.length > 0) {
      const fetched = await batchFetch(missingKeys);
      const isMap = fetched instanceof Map;
      const pipeline = redis.status === "ready" ? redis.pipeline() : null;

      for (let i = 0; i < missingKeys.length; i++) {
        const key = missingKeys[i] as K;
        const resultIndex = missingIndices[i] as number;
        const record = isMap
          ? fetched.get(key)
          : (fetched as Record<string, V>)[String(key)];

        if (record !== undefined) {
          results[resultIndex] = record;
          if (pipeline) {
            pipeline.set(`${prefix}:${key}`, JSON.stringify(record), "EX", ttl);
          }
        }
      }

      if (pipeline) {
        pipeline.exec().catch(() => {});
      }
    }

    return results;
  });
}
