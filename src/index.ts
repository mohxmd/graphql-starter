import { createYoga } from "graphql-yoga";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { db } from "./db";
import env from "./env";
import { createContext } from "./graphql/context";
import { schema } from "./graphql/schema";
import { logger } from "./lib/utils/logger";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowHeaders: ["Authorization", "Content-Type", "X-Custom-Header"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Request Logger
app.use("*", async (c, next) => {
  const start = performance.now();
  await next();
  const duration = (performance.now() - start).toFixed(2);
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${duration}ms`);
});

// Health & Information Endpoints
app.get("/", (c) => {
  return c.json({
    name: "breeze-graphql-api",
    version: "1.0.0",
    environment: env.NODE_ENV,
    graphql: `http://localhost:${env.PORT}/graphql`,
    health: `http://localhost:${env.PORT}/health`,
  });
});

app.get("/health", async (c) => {
  let dbStatus = "unknown";
  try {
    // Quick SQLite health probe
    await db.query.task.findFirst();
    dbStatus = "connected";
  } catch (error: unknown) {
    dbStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  const isHealthy = dbStatus === "connected";
  return c.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

// Example Webhooks Router (e.g. Stripe / Payment Webhooks)
app.post("/webhooks/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  const rawBody = await c.req.text();

  logger.info("Received Stripe webhook", {
    signaturePresent: Boolean(signature),
    bodyLength: rawBody.length,
  });

  // Handle Stripe signature verification & subscription updates here...
  return c.json({ received: true });
});

// GraphQL Yoga Instance
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

// Mount GraphQL Yoga Handler to Hono
app.all("/graphql", async (c) => {
  return yoga.fetch(c.req.raw, c);
});

//  Start Server on Bun Runtime
const server = Bun.serve({
  port: Number(env.PORT) || 3000,
  fetch: app.fetch,
});

logger.info(`🚀 Server running at http://${server.hostname}:${server.port}`);
logger.info(
  `⚡ GraphQL Studio: http://${server.hostname}:${server.port}/graphql`
);

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  logger.info(`${signal} signal received. Closing server gracefully...`);
  server.stop();
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
