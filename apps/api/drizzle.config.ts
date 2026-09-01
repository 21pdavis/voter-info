import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Filled from apps/api/.env — see .env.example
    url: process.env.DATABASE_URL ?? "",
  },
});
