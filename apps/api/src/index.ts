import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { legislatorsRouter } from "./routes/legislators";

const app = express();

app.use(cors());
app.use(express.json());

// Auth is wired but optional: Clerk only activates once CLERK_SECRET_KEY is set.
// Until then the API runs open, which is fine for local hello-world work.
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  console.log("[auth] Clerk middleware enabled");
} else {
  console.log("[auth] Clerk disabled (no CLERK_SECRET_KEY set)");
}

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "voter-info-api" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/legislators", legislatorsRouter);

// 0.0.0.0 so the API is reachable from Docker and from a physical phone on the LAN.
const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`voter-info-api listening on http://localhost:${port}`);
});
