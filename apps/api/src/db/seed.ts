import "dotenv/config";
import { db } from "./client";
import { legislators } from "./schema";
import { SAMPLE_LEGISLATORS } from "../data/sample-legislators";

async function main() {
  if (!db) {
    throw new Error("DATABASE_URL is not set — cannot seed. Fill apps/api/.env first.");
  }
  await db.delete(legislators);
  await db.insert(legislators).values(SAMPLE_LEGISLATORS);
  console.log(`Seeded ${SAMPLE_LEGISLATORS.length} legislators.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
