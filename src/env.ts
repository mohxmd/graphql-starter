/** biome-ignore-all lint/style/noProcessEnv: Valid in bun runtime */
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DB_FILE_NAME: z.string().default("breeze.sqlite"),
  DEBUG: z.string().default("1"),
  JWT_SECRET: z
    .string()
    .default("dev-secret-change-in-production-min-32-chars-long"),
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
