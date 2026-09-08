import { Router } from "express";
import { getAuth } from "@clerk/express";

export const meRouter = Router();

// GET /api/me
// Protected: returns 401 unless the request carries a valid Clerk session token.
// Proves the mobile app's Bearer token is actually verified server-side.
meRouter.get("/", (req, res) => {
  // getAuth throws if clerkMiddleware isn't in the chain (i.e. CLERK_SECRET_KEY unset).
  let auth: ReturnType<typeof getAuth> | null = null;
  try {
    auth = getAuth(req);
  } catch {
    return res.status(503).json({ error: "Auth is not configured on this server" });
  }

  if (!auth.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.json({ userId: auth.userId, sessionId: auth.sessionId });
});
