import type z from "zod";
import type { insertTasksSchema, patchTasksSchema } from "@/db/schema";
import type { Context } from "@/graphql/context";
import { GraphQLException } from "@/lib/error/exceptions";
import type { TaskRecord } from "./task.loader";
import { TaskService } from "./task.services";

export const taskResolvers = {
  Query: {
    tasks: async (_: unknown, args: { limit?: number; offset?: number }) => {
      return await TaskService.getAllTasks(args);
    },

    task: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      return await ctx.loaders.taskLoader.load(id);
    },
  },

  Mutation: {
    createTask: async (
      _: unknown,
      { input }: { input: z.infer<typeof insertTasksSchema> },
      _ctx: Context
    ) => {
      try {
        return await TaskService.createTask(input);
      } catch (error) {
        if (error instanceof GraphQLException) throw error;
        throw GraphQLException.internal(
          "Failed to create task",
          error as Error
        );
      }
    },

    updateTask: async (
      _: unknown,
      { input }: { input: z.infer<typeof patchTasksSchema> },
      _ctx: Context
    ) => {
      try {
        return await TaskService.updateTask(input);
      } catch (error) {
        if (error instanceof GraphQLException) throw error;
        throw GraphQLException.internal(
          "Failed to update task",
          error as Error
        );
      }
    },

    deleteTask: async (_: unknown, { id }: { id: string }, _ctx: Context) => {
      try {
        return await TaskService.deleteTask(id);
      } catch (error) {
        if (error instanceof GraphQLException) throw error;
        throw GraphQLException.internal(
          "Failed to delete task",
          error as Error
        );
      }
    },

    toggleTaskComplete: async (
      _: unknown,
      { id }: { id: string },
      _ctx: Context
    ) => {
      try {
        return await TaskService.toggleTaskComplete(id);
      } catch (error) {
        if (error instanceof GraphQLException) throw error;
        throw GraphQLException.internal(
          "Failed to toggle task",
          error as Error
        );
      }
    },
  },

  Task: {
    createdAt: (t: TaskRecord) =>
      t.createdAt
        ? new Date(t.createdAt).toISOString()
        : new Date().toISOString(),
    updatedAt: (t: TaskRecord) =>
      t.updatedAt
        ? new Date(t.updatedAt).toISOString()
        : new Date().toISOString(),
    deletedAt: (t: TaskRecord) =>
      t.deletedAt ? new Date(t.deletedAt).toISOString() : null,
  },
};
