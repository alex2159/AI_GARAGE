import { Hono } from "hono";
import { getDb } from "../queries/connection";
import { sql } from "drizzle-orm";

export const healthRoutes = new Hono();

// GET /api/v1/health — liveness/readiness probe.
// Returns 200 with {"status":"ok"} when the process and the database are up.
healthRoutes.get("/", async (c) => {
  let db = "up";
  try {
    await getDb().execute(sql`SELECT 1`);
  } catch {
    db = "down";
  }
  const ok = db === "up";
  return c.json(
    {
      status: ok ? "ok" : "degraded",
      db,
      ts: new Date().toISOString(),
    },
    ok ? 200 : 503,
  );
});
