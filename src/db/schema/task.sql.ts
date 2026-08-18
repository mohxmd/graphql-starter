import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { id, timestamps } from "./_helpers";

export const task = pgTable("tasks", {
  id,

  name: text("name").notNull(),
  done: boolean("done").notNull().default(false),

  ...timestamps,
});

export const selectTasksSchema = createSelectSchema(task);
export const insertTasksSchema = createInsertSchema(task);
export const patchTasksSchema = insertTasksSchema.partial().extend({
  id: z.string().uuid(),
});
