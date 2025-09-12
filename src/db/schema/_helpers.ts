import { randomUUID } from "node:crypto";
import { integer, text } from "drizzle-orm/sqlite-core";

export const id = text()
  .primaryKey()
  .$defaultFn(() => randomUUID());

export const createdAt = integer({ mode: "timestamp" }).$defaultFn(
  () => new Date()
);

export const updatedAt = integer({ mode: "timestamp" })
  .$defaultFn(() => new Date())
  .$onUpdate(() => new Date());

export const deletedAt = integer({ mode: "timestamp" });

export const timestamps = { createdAt, updatedAt, deletedAt };
