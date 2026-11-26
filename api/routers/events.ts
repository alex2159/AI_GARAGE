import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { CITY_CODES } from "@contracts/cities";
import {
  EVENT_TYPES,
  EVENT_TYPE_NAMES,
  eventsFilterSchema,
} from "@contracts/events";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import { findEventById, findEvents } from "../queries/events";

export const eventsRouter = createRouter({
  // GET /events?city=&from=&to=&type=&page=&pageSize=
  // Город по умолчанию — из профиля пользователя.
  list: authedQuery
    .input(
      eventsFilterSchema.extend({
        city: z.enum(CITY_CODES).optional(),
      }),
    )
    .query(({ ctx, input }) => {
      const city = input.city ?? ctx.user.city;
      if (!city) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Город не выбран: заполните профиль или передайте параметр city",
        });
      }
      const { city: _omit, ...filter } = input;
      return findEvents({ ...filter, city });
    }),

  // GET /events/{id}
  byId: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const event = await findEventById(input.id);
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Событие не найдено" });
      }
      return event;
    }),

  // GET /events/types — справочник типов с русскими названиями.
  types: publicQuery.query(() =>
    EVENT_TYPES.map((code) => ({ code, name: EVENT_TYPE_NAMES[code] })),
  ),
});
