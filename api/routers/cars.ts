import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { carInputSchema } from "@contracts/cars";
import { createRouter, authedQuery } from "../middleware";
import {
  deleteCar,
  findCarsByUser,
  findUserCar,
  insertCar,
  updateCar,
} from "../queries/cars";

const notFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Автомобиль не найден" });

const carIdSchema = z.object({ id: z.number().int().positive() });

export const carsRouter = createRouter({
  // GET /users/me/cars — список авто текущего пользователя.
  list: authedQuery.query(({ ctx }) => findCarsByUser(ctx.user.id)),

  // GET /users/me/cars/{id} — карточка авто (только владелец).
  byId: authedQuery.input(carIdSchema).query(async ({ ctx, input }) => {
    const car = await findUserCar(ctx.user.id, input.id);
    if (!car) throw notFound();
    return car;
  }),

  // POST /users/me/cars — добавление авто.
  create: authedQuery
    .input(carInputSchema)
    .mutation(({ ctx, input }) =>
      insertCar({ ...input, userId: ctx.user.id }),
    ),

  // PATCH /users/me/cars/{id} — обновление авто (только владелец).
  update: authedQuery
    .input(carIdSchema.extend({ data: carInputSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await findUserCar(ctx.user.id, input.id);
      if (!existing) throw notFound();
      return updateCar(ctx.user.id, input.id, input.data);
    }),

  // DELETE /users/me/cars/{id} — удаление авто (только владелец).
  remove: authedQuery
    .input(carIdSchema)
    .mutation(async ({ ctx, input }) => {
      const removed = await deleteCar(ctx.user.id, input.id);
      if (!removed) throw notFound();
      return { success: true };
    }),
});
