import { z } from "zod";

// Типы событий календаря и общие правила (бэкенд и фронтенд).

export const EVENT_TYPES = [
  "MEETUP",
  "EXHIBITION",
  "RALLY",
  "FESTIVAL",
  "OTHER",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_NAMES: Record<EventType, string> = {
  MEETUP: "Встреча клуба",
  EXHIBITION: "Выставка",
  RALLY: "Ралли",
  FESTIVAL: "Фестиваль",
  OTHER: "Другое",
};

export const EVENT_DESCRIPTION_MAX = 5000;

// Фильтр списка событий: дата в формате YYYY-MM-DD.
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const eventsFilterSchema = z.object({
  from: z.string().regex(DATE_RE, "Формат даты: YYYY-MM-DD").optional(),
  to: z.string().regex(DATE_RE, "Формат даты: YYYY-MM-DD").optional(),
  type: z.enum(EVENT_TYPES).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type EventsFilter = z.input<typeof eventsFilterSchema>;

export type EventDTO = {
  id: number;
  externalId: string;
  title: string;
  eventDate: string;
  startTime: string | null;
  city: string;
  type: EventType;
  location: string | null;
  description: string;
};
