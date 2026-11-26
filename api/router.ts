import { authRouter } from "./auth-router";
import { profileRouter } from "./routers/profile";
import { carsRouter } from "./routers/cars";
import { eventsRouter } from "./routers/events";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  cars: carsRouter,
  events: eventsRouter,
});

export type AppRouter = typeof appRouter;
