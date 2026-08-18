import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import env from "@/env";

async function runMigrations() {
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  try {
    console.log("🐘 Running PostgreSQL migrations...");
    await migrate(migrationDb, { migrationsFolder: "./src/db/migrations" });
    console.log("✓ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
