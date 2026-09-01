import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * One row per elected official we track.
 *
 * `role` is a plain string for now (no enum) so it is trivial to add new
 * categories later without a schema migration. Expected values:
 *   - "us_senator"            federal U.S. Senator
 *   - "state_senator"         member of the state upper chamber
 *   - "state_representative"  member of the state lower chamber (House / Assembly)
 */
export const legislators = pgTable("legislators", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  party: text("party"),
  state: text("state").notNull(), // two-letter USPS code, e.g. "CA"
  district: text("district"), // null for statewide offices like U.S. Senate
  phone: text("phone"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Legislator = typeof legislators.$inferSelect;
export type NewLegislator = typeof legislators.$inferInsert;
