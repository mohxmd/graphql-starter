import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid("id").defaultRandom().primaryKey();

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
};
