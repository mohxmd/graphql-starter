/** biome-ignore-all lint/style/noProcessEnv: Valid in bun runtime */
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production"]),
  DB_FILE_NAME: z.string(),
  DEBUG: z.string().default("1"),
});

const processEnv = EnvSchema.safeParse(process.env);

if (!processEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(
    JSON.stringify(z.flattenError(processEnv.error).fieldErrors, null, 2)
  );
  process.exit(1);
}

const env = processEnv.data;

export default env;
export type Env = z.infer<typeof EnvSchema>;
