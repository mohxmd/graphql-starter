import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { task } from "@/db/schema";
import { createCachedLoader } from "@/lib/cache/loader";

export type TaskRecord = typeof task.$inferSelect;

export function createTaskLoader() {
  return createCachedLoader<string, TaskRecord>({
    prefix: "task",
    ttl: 3600,
    batchFetch: async (ids) => {
      const records = await db
        .select()
        .from(task)
        .where(inArray(task.id, ids as string[]));

      return new Map(records.map((r) => [r.id, r]));
    },
  });
}
