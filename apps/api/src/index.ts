import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { clerkPlugin } from "@clerk/fastify";
import { legislatorsRoutes } from "./routes/legislators";

const isProd = process.env.NODE_ENV === "production";

const app = Fastify({
  logger: isProd
    ? true
    : {
        transport: {
          target: "pino-pretty",
          options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      },
});

async function main() {
  await app.register(cors);

  // Auth is wired but optional: Clerk only activates once CLERK_SECRET_KEY is set.
  // Until then the API runs open, which is fine for local hello-world work.
  if (process.env.CLERK_SECRET_KEY) {
    await app.register(clerkPlugin);
    app.log.info("[auth] Clerk plugin enabled");
  } else {
    app.log.info("[auth] Clerk disabled (no CLERK_SECRET_KEY set)");
  }

  app.get("/", async () => ({ ok: true, service: "voter-info-api" }));
  app.get("/health", async () => ({ status: "ok", time: new Date().toISOString() }));

  await app.register(legislatorsRoutes, { prefix: "/api/legislators" });

  // 0.0.0.0 so the API is reachable from Docker and from a physical phone on the LAN.
  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
