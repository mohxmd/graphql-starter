import type z from "zod";
import type { insertTasksSchema, patchTasksSchema } from "@/db/schema";
import type { Context } from "@/graphql/context";
import { GraphQLException } from "@/lib/error/exceptions";
import { TaskService } from "./task.services";

export const taskResolvers = {
  Query: {
    tasks: async () => {
      return await TaskService.getAllTasks();
    },

    task: async (_: unknown, { id }: { id: string }) => {
      return await TaskService.getTaskById(id);
    },
  },

  Mutation: {
    createTask: async (
      _: unknown,
      { input }: { input: z.infer<typeof insertTasksSchema> },
      _context: Context
    ) => {
      try {
        return await TaskService.createTask(input);
      } catch (error) {
        throw new GraphQLException("INTERNAL_ERROR", {
          message: "Failed to create task",
          cause: error as Error,
        });
      }
    },

    updateTask: async (
      _: unknown,
      { input }: { input: z.infer<typeof patchTasksSchema> },
      _context: Context
    ) => {
      try {
        return await TaskService.updateTask(input);
      } catch (error) {
        throw new GraphQLException("INTERNAL_ERROR", {
          message: "Failed to update task",
          cause: error as Error,
        });
      }
    },

    deleteTask: async (
      _: unknown,
      { id }: { id: string },
      _context: Context
    ) => {
      try {
        return await TaskService.deleteTask(id);
      } catch (error) {
        throw new GraphQLException("INTERNAL_ERROR", {
          message: "Failed to delete task",
          cause: error as Error,
        });
      }
    },

    toggleTaskComplete: async (
      _: unknown,
      { id }: { id: string },
      _context: Context
    ) => {
      try {
        return await TaskService.toggleTaskComplete(id);
      } catch (error) {
        throw new GraphQLException("INTERNAL_ERROR", {
          message: "Failed to toggle task",
          cause: error as Error,
        });
      }
    },
  },
};
