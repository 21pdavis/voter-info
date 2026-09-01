import { Router } from "express";
import { db } from "../db/client";
import { legislators } from "../db/schema";
import { SAMPLE_LEGISLATORS } from "../data/sample-legislators";

export const legislatorsRouter = Router();

// GET /api/legislators
// Optional query param: ?state=CA
legislatorsRouter.get("/", async (req, res) => {
  const state = typeof req.query.state === "string" ? req.query.state.toUpperCase() : null;

  if (!db) {
    const data = state
      ? SAMPLE_LEGISLATORS.filter((l) => l.state === state)
      : SAMPLE_LEGISLATORS;
    return res.json({ source: "sample", count: data.length, data });
  }

  const rows = await db.select().from(legislators);
  const data = state ? rows.filter((l) => l.state === state) : rows;
  return res.json({ source: "database", count: data.length, data });
});
