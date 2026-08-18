import { Redis } from "ioredis";
import env from "@/env";
import { logger } from "../utils/logger";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on("connect", () => {
      logger.info("🔴 Connected to Redis cache");
    });

    redisClient.on("error", (err) => {
      // Non-crashing log
      logger.warn(`Redis connection warning: ${err.message}`);
    });
  }

  return redisClient;
}
