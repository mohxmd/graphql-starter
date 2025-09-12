import { eq } from "drizzle-orm";
import type z from "zod";

import { db } from "@/db";
import { insertTasksSchema, patchTasksSchema, task } from "@/db/schema";
import { GraphQLException } from "@/lib/error/exceptions";

export class TaskService {
  static async getAllTasks() {
    return await db.select().from(task);
  }

  static async getTaskById(id: string) {
    const [result] = await db.select().from(task).where(eq(task.id, id));
    if (!result)
      throw new GraphQLException("NOT_FOUND", {
        message: "Task not found",
      });
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

    await TaskService.getTaskById(id);

    const [updatedTask] = await db
      .update(task)
      .set(updates)
      .where(eq(task.id, id))
      .returning();

    return updatedTask;
  }

  static async deleteTask(id: string) {
    await TaskService.getTaskById(id);
    const [result] = await db.delete(task).where(eq(task.id, id)).returning();
    return result;
  }

  static async toggleTaskComplete(id: string) {
    const _task = await TaskService.getTaskById(id);
    const [updatedTask] = await db
      .update(task)
      .set({ done: !_task.done })
      .where(eq(task.id, id))
      .returning();

    return updatedTask;
  }
}
