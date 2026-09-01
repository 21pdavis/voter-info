import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

/**
 * `db` is null when DATABASE_URL is not set. That keeps the hello-world API
 * runnable before Supabase is wired up — routes fall back to sample data.
 */
export const db = url
  ? drizzle(postgres(url, { prepare: false }), { schema })
  : null;
