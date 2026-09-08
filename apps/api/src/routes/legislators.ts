import type { FastifyPluginAsync } from "fastify";
import { db } from "../db/client";
import { legislators } from "../db/schema";
import { SAMPLE_LEGISLATORS } from "../data/sample-legislators";

// GET /api/legislators
// Optional query param: ?state=CA
export const legislatorsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { state?: string } }>("/", async (req) => {
    const state =
      typeof req.query.state === "string" ? req.query.state.toUpperCase() : null;

    if (!db) {
      const data = state
        ? SAMPLE_LEGISLATORS.filter((l) => l.state === state)
        : SAMPLE_LEGISLATORS;
      return { source: "sample", count: data.length, data };
    }

    const rows = await db.select().from(legislators);
    const data = state ? rows.filter((l) => l.state === state) : rows;
    return { source: "database", count: data.length, data };
  });
};
