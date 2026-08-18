import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { db, queryClient } from "./db";
import env from "./env";
import { createContext } from "./graphql/context";
import { schema } from "./graphql/schema";
import { getRedisClient } from "./lib/redis";
import { logger } from "./lib/utils/logger";

const app = new Hono();

// Middleware
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowHeaders: ["Authorization", "Content-Type", "X-Custom-Header"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const start = performance.now();
  await next();
  const duration = (performance.now() - start).toFixed(2);
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${duration}ms`);
});

// Service Information
app.get("/", (c) => {
  return c.json({
    name: "breeze-graphql-api",
    version: "1.0.0",
    engine: "GraphQL Yoga + Hono + Drizzle ORM (PostgreSQL 17) + Redis",
    environment: env.NODE_ENV,
    graphql: `http://localhost:${env.PORT}/graphql`,
    health: `http://localhost:${env.PORT}/health`,
  });
});

// Health Checks
app.get("/health", async (c) => {
  let dbStatus = "unknown";
  let redisStatus = "unknown";

  try {
    await db.query.task.findFirst();
    dbStatus = "connected";
  } catch (error: unknown) {
    dbStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  try {
    const redis = getRedisClient();
    const pong = await redis.ping();
    redisStatus = pong === "PONG" ? "connected" : "degraded";
  } catch (error: unknown) {
    redisStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  const isHealthy = dbStatus === "connected";
  return c.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

// Webhook Handlers
app.post("/webhooks/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  const rawBody = await c.req.text();

  logger.info("Received Stripe webhook", {
    signaturePresent: Boolean(signature),
    bodyLength: rawBody.length,
  });

  return c.json({ received: true });
});

// GraphQL Yoga Server
const yoga = createYoga({
  schema,
  context: createContext,
  landingPage: false,
  graphqlEndpoint: "/graphql",
  logging: env.NODE_ENV === "development",

  graphiql: (request) => {
    if (
      env.NODE_ENV === "development" ||
      request.headers.get("graphiql-enabled")
    ) {
      return {
        title: "Breeze GraphQL Studio",
        favicon: "⚡",
        shouldPersistHeaders: true,
        defaultQuery: /* GraphQL */ `
          query GetTasks {
            tasks(limit: 10) {
              id
              name
              done
              createdAt
            }
          }
        `,
      };
    }
    return false;
  },

  maskedErrors: env.NODE_ENV === "production",
});

app.all("/graphql", async (c) => {
  return yoga.fetch(c.req.raw, c);
});

// HTTP Server
const server = Bun.serve({
  port: Number(env.PORT) || 3000,
  fetch: app.fetch,
});

logger.info(`🚀 Server running at http://${server.hostname}:${server.port}`);
logger.info(
  `⚡ GraphQL Studio: http://${server.hostname}:${server.port}/graphql`
);

// Lifecycle & Graceful Shutdown
const handleShutdown = async (signal: string) => {
  logger.info(`${signal} signal received. Closing connections gracefully...`);
  server.stop();
  try {
    await queryClient.end({ timeout: 5 });
    const redis = getRedisClient();
    redis.disconnect();
  } catch {}
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
