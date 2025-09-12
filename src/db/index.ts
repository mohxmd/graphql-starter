import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import env from "@/env";

import * as schema from "./schema";

const sqlite = new Database(env.DB_FILE_NAME);
export const db = drizzle(sqlite, {
  schema,
  casing: "snake_case",
  logger: env.NODE_ENV === "development",
});
