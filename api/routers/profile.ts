import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { CITIES, CITY_CODES } from "@contracts/cities";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import { updateUserProfile } from "../queries/users";

function toProfile(user: {
  id: number;
  name: string | null;
  email: string | null;
  city: string | null;
}) {
  return {
    id: user.id,
    displayName: user.name ?? "",
    email: user.email ?? "",
    city: user.city,
  };
}

export const profileRouter = createRouter({
  // GET /users/me — профиль текущего пользователя.
  me: authedQuery.query(({ ctx }) => toProfile(ctx.user)),

  // PATCH /users/me — обновление профиля (имя, город из справочника).
  update: authedQuery
    .input(
      z.object({
        displayName: z
          .string()
          .trim()
          .min(1, "Укажите имя")
          .max(255, "Не более 255 символов")
          .optional(),
        city: z
          .enum(CITY_CODES, {
            message:
              "Город должен быть из справочника: Москва, Санкт-Петербург, Казань, Нижний Новгород",
          })
          .nullable()
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.displayName === undefined && input.city === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Нет полей для обновления",
        });
      }
      await updateUserProfile(ctx.user.id, {
        ...(input.displayName !== undefined
          ? { name: input.displayName }
          : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
      });
      return { success: true };
    }),

  // GET /cities — справочник городов MVP.
  cities: publicQuery.query(() => CITIES),
});
