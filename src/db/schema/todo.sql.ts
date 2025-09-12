import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { id, timestamps } from "./_helpers";

export const task = sqliteTable("task", {
  id,

  name: text().notNull(),
  done: integer({ mode: "boolean" }).notNull().default(false),

  ...timestamps,
});

export const selectTasksSchema = createSelectSchema(task);
export const insertTasksSchema = createInsertSchema(task);
export const patchTasksSchema = insertTasksSchema.partial().extend({
  id: z.string(),
});
