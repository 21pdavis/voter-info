import "dotenv/config";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { legislatorsRouter } from "./routes/legislators";
import { meRouter } from "./routes/me";

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
app.use("/api/me", meRouter);

// JSON error handler. Notably, clerkMiddleware() throws on a malformed bearer
// token; treat those as 401 rather than letting Express return an HTML
// stack-trace page.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isTokenError =
    err instanceof SyntaxError || /token|jwt/i.test(String(err?.message ?? ""));
  if (isTokenError) {
    return res.status(401).json({ error: "Invalid token" });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal error" });
};
app.use(errorHandler);

// 0.0.0.0 so the API is reachable from Docker and from a physical phone on the LAN.
const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`voter-info-api listening on http://localhost:${port}`);
});
