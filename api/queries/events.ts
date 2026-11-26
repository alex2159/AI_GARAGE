import { and, asc, count, eq, gte, lte, type SQL } from "drizzle-orm";
import * as schema from "@db/schema";
import type { EventType } from "@contracts/events";
import { getDb } from "./connection";

export type EventsQuery = {
  city: string;
  from?: string;
  to?: string;
  type?: EventType;
  page: number;
  pageSize: number;
};

// Список событий города за период, сортировка по дате и времени начала.
export async function findEvents(q: EventsQuery) {
  const where: SQL[] = [eq(schema.events.city, q.city)];
  if (q.from) where.push(gte(schema.events.eventDate, q.from));
  if (q.to) where.push(lte(schema.events.eventDate, q.to));
  if (q.type) where.push(eq(schema.events.type, q.type));
  const condition = and(...where);

  const db = getDb();
  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(schema.events)
      .where(condition)
      .orderBy(asc(schema.events.eventDate), asc(schema.events.startTime))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.select({ total: count() }).from(schema.events).where(condition),
  ]);
  return { items, total, page: q.page, pageSize: q.pageSize };
}

export async function findEventById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.events)
    .where(eq(schema.events.id, id))
    .limit(1);
  return rows.at(0);
}
