import { authRouter } from "./auth-router";
import { profileRouter } from "./routers/profile";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
