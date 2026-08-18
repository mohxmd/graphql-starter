import { inArray } from "drizzle-orm";
import DataLoader from "dataloader";
import { db } from "@/db";
import { task } from "@/db/schema";

export type TaskRecord = typeof task.$inferSelect;

/**
 * Batched Task DataLoader.
 * Automatically aggregates individual load(id) calls into a single batch WHERE id IN (...) query,
 * eliminating the GraphQL N+1 problem.
 */
export function createTaskLoader() {
  return new DataLoader<string, TaskRecord | null>(async (taskIds) => {
    const records = await db
      .select()
      .from(task)
      .where(inArray(task.id, taskIds as string[]));

    const taskMap = new Map<string, TaskRecord>();
    for (const record of records) {
      taskMap.set(record.id, record);
    }

    return taskIds.map((id) => taskMap.get(id) || null);
  });
}
