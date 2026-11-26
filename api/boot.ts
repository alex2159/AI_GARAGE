import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { log } from "./lib/logger";
import { handleClientLog } from "./lib/clientlog";
import { REQUEST_ID_HEADER, runWithRequestId } from "./lib/requestcontext";
import { healthRoutes } from "./routes/health";
import { docsRoutes } from "./routes/docs";
import { seedEventsIfEmpty } from "./events/importer";

const app = new Hono<{ Bindings: HttpBindings }>();

// Request observability: one middleware mints a request id, echoes it on the
// response header (what the browser logger reads) and writes one access line
// per request. /api/log is skipped: it is the browser's log sink, and an access
// line per POSTed batch would be self-amplifying noise in the very file it writes.
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  if (c.req.path === "/api/log") {
    await next();
    return;
  }
  const start = Date.now();
  await runWithRequestId(requestId, async () => {
    await next();
    c.res.headers.set(REQUEST_ID_HEADER, requestId);
    if (!c.req.path.startsWith("/api/")) return;
    log.info("request", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - start,
    });
  });
});

// Scoped to the tRPC route, NOT global: on the dev server a global bodyLimit
// breaks bodyless requests (DELETE/PATCH on REST routes would 500 at dispatch).
app.use("/api/trpc/*", bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
// Browser-side log sink (see lib/clientlog.ts). Registered before the /api/*
// 404 catch-all below.
app.post(
  "/api/log",
  bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.body(null, 413) }),
  handleClientLog,
);

// REST routes (non-tRPC): health probe and OpenAPI docs.
// Registered above the /api/* 404 catch-all on purpose.
app.route("/api/v1/health", healthRoutes);
app.route("/", docsRoutes);

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Unhandled request errors: response stays a generic 500 (no stack leaked to
// the caller); the detail goes to the structured log only.
app.onError((err, c) => {
  log.error("unhandled request error", {
    method: c.req.method,
    path: c.req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;

// Автонаполнение календаря при первом старте (идемпотентно, не блокирует boot).
// Ошибка сида не должна ронять сервис — календарь наполнится при следующем старте.
void seedEventsIfEmpty().catch((err) =>
  log.error("events seed failed", {
    error: err instanceof Error ? err.message : String(err),
  }),
);

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    log.info(`Server running on http://localhost:${port}/`);
  });
}
