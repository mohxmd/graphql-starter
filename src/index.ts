import { createYoga } from "graphql-yoga";

import env from "./env";
import { createContext } from "./graphql/context";
import { schema } from "./graphql/schema";
import { logger } from "./lib/utils/logger";

const yoga = createYoga({
  schema,
  context: createContext,
  landingPage: false,
  graphqlEndpoint: "/graphql",
  healthCheckEndpoint: "/health",
  logging: env.NODE_ENV === "development",

  cors: (request) => {
    const requestOrigin = request.headers.get("origin");
    return {
      origin: requestOrigin || undefined,
      credentials: true,
      allowedHeaders: ["X-Custom-Header"],
      methods: ["GET", "POST"],
    };
  },

  graphiql(request) {
    if (
      env.NODE_ENV === "development" ||
      request.headers.get("graphiql-enabled")
    ) {
      return {
        title: "Task Manager API",
        favicon: "👻",
        shouldPersistHeaders: false,
        defaultQuery: /* GraphQL */ `
          query GetTasks {
            tasks {
              id
              name
              done
            }
          }
        `,
      };
    }
    return false;
  },

  maskedErrors: true,
});

const server = Bun.serve({
  port: env.PORT || 3000,
  fetch: yoga,
});

logger.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`
  )}`
);
