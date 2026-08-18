import { eq, sql } from "drizzle-orm";
import type z from "zod";

import { db } from "@/db";
import { insertTasksSchema, patchTasksSchema, task } from "@/db/schema";
import { GraphQLException } from "@/lib/error/exceptions";

export class TaskService {
  static async getAllTasks(options: { limit?: number; offset?: number } = {}) {
    const safeLimit = Math.min(Math.max(1, options.limit ?? 50), 100);
    const safeOffset = Math.max(0, options.offset ?? 0);

    return await db.select().from(task).limit(safeLimit).offset(safeOffset);
  }

  static async getTaskById(id: string) {
    const [result] = await db.select().from(task).where(eq(task.id, id));
    if (!result) {
      throw GraphQLException.notFound(`Task with ID "${id}" not found`);
    }
    return result;
  }

  static async createTask(input: z.infer<typeof insertTasksSchema>) {
    const validatedInput = insertTasksSchema.parse(input);

    const [newTask] = await db
      .insert(task)
      .values({
        ...validatedInput,
        done: false,
      })
      .returning();

    return newTask;
  }

  static async updateTask(input: z.infer<typeof patchTasksSchema>) {
    const validatedInput = patchTasksSchema.parse(input);
    const { id, ...updates } = validatedInput;

    const [updatedTask] = await db
      .update(task)
      .set({
        ...updates,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(task.id, id))
      .returning();

    if (!updatedTask) {
      throw GraphQLException.notFound(`Task with ID "${id}" not found`);
    }

    return updatedTask;
  }

  static async deleteTask(id: string) {
    const [deletedRecord] = await db
      .delete(task)
      .where(eq(task.id, id))
      .returning();

    if (!deletedRecord) {
      throw GraphQLException.notFound(`Task with ID "${id}" not found`);
    }

    return true;
  }

  static async toggleTaskComplete(id: string) {
    const existing = await TaskService.getTaskById(id);

    const [updatedTask] = await db
      .update(task)
      .set({
        done: !existing.done,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(task.id, id))
      .returning();

    return updatedTask;
  }
}
