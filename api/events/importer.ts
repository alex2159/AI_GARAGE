import { inArray } from "drizzle-orm";
import { events } from "@db/schema";
import { getDb } from "../queries/connection";
import { MockEventSource } from "./mock-source";
import type { EventSourcePort } from "./source";

// Выбор источника по конфигурации. MVP знает только "mock";
// реальный источник добавляется здесь одной строкой.
function resolveSource(): EventSourcePort {
  const kind = process.env.EVENTS_SOURCE ?? "mock";
  if (kind !== "mock") {
    throw new Error(`Неизвестный EVENTS_SOURCE: ${kind} (доступно: mock)`);
  }
  return new MockEventSource();
}

// Идемпотентный импорт: вставляет только события с новыми externalId.
export async function importEvents(): Promise<{ inserted: number; total: number }> {
  const source = resolveSource();
  const fetched = await source.fetchEvents();
  if (fetched.length === 0) return { inserted: 0, total: 0 };

  const db = getDb();
  const existing = await db
    .select({ externalId: events.externalId })
    .from(events)
    .where(
      inArray(
        events.externalId,
        fetched.map((e) => e.externalId),
      ),
    );
  const known = new Set(existing.map((r) => r.externalId));
  const fresh = fetched.filter((e) => !known.has(e.externalId));

  if (fresh.length > 0) {
    await db.insert(events).values(fresh);
  }
  return { inserted: fresh.length, total: fetched.length };
}

// Автонаполнение при старте сервиса: только если таблица пуста.
export async function seedEventsIfEmpty(): Promise<void> {
  const db = getDb();
  const rows = await db.select({ id: events.id }).from(events).limit(1);
  if (rows.length > 0) return;
  const { inserted } = await importEvents();
  console.log(`[events] seeded ${inserted} mock events`);
}
