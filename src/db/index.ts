import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import env from "@/env";

import * as schema from "./schema";

export const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === "production" ? 20 : 5,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, {
  schema,
  casing: "snake_case",
  logger: env.NODE_ENV === "development",
});

export type Database = typeof db;
