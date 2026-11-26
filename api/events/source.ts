import type { CityCode } from "@contracts/cities";
import type { EventType } from "@contracts/events";

// Событие в терминах внешнего источника (до сохранения в БД).
export type ExternalEvent = {
  externalId: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM
  city: CityCode;
  type: EventType;
  location: string | null;
  description: string;
};

// Порт источника событий: MVP — mock, позже сюда подключается
// реальный парсер открытых источников без изменения остального кода.
export interface EventSourcePort {
  readonly name: string;
  fetchEvents(): Promise<ExternalEvent[]>;
}
