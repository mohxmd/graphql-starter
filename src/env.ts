/** biome-ignore-all lint/style/noProcessEnv: Valid in bun runtime */
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/breeze_db"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  DEBUG: z.string().default("1"),
  JWT_SECRET: z
    .string()
    .default("super-secret-key-change-in-production-min-32-chars-long"),
});

export type Env = z.infer<typeof EnvSchema>;

let env: Env;

try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(error.format(), null, 2));
  }
  process.exit(1);
}

export default env;
