import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { cityName } from "@contracts/cities";
import {
  EVENT_TYPE_NAMES,
  type EventDTO,
  type EventType,
} from "@contracts/events";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ALL_TYPES = "ALL" as const;

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  weekday: "long",
});
const fullDateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

function formatDay(iso: string) {
  return dateFmt.format(new Date(`${iso}T12:00:00`));
}

export default function Events() {
  const [type, setType] = useState<EventType | typeof ALL_TYPES>(ALL_TYPES);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EventDTO | null>(null);

  const input = useMemo(
    () => ({
      ...(type !== ALL_TYPES ? { type } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      page,
      pageSize: 20,
    }),
    [type, from, to, page],
  );

  const { data, isLoading, error } = trpc.events.list.useQuery(input);
  const noCity = error?.data?.code === "BAD_REQUEST";

  const resetPage = () => setPage(1);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const groups = useMemo(() => {
    const map = new Map<string, EventDTO[]>();
    for (const e of data?.items ?? []) {
      const list = map.get(e.eventDate) ?? [];
      list.push(e);
      map.set(e.eventDate, list);
    }
    return [...map.entries()];
  }, [data]);

  return (
    <section className="grid gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          Календарь
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          События в городе
        </h1>
      </header>

      {/* Фильтры */}
      <div className="grid gap-3 border border-neutral-200 p-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
            Тип
          </Label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as EventType | typeof ALL_TYPES);
              resetPage();
            }}
          >
            <SelectTrigger className="rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-sm">
              <SelectItem value={ALL_TYPES}>Все типы</SelectItem>
              {Object.entries(EVENT_TYPE_NAMES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
            С даты
          </Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              resetPage();
            }}
            className="rounded-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
            По дату
          </Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              resetPage();
            }}
            className="rounded-sm"
          />
        </div>
      </div>

      {noCity ? (
        <div className="border border-dashed border-neutral-300 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            Город не выбран
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
            Календарь показывает события вашего города. Укажите город в
            профиле — это займёт десять секунд.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex h-11 items-center border border-neutral-900 bg-neutral-900 px-6 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-white hover:text-neutral-900"
          >
            Заполнить профиль
          </Link>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-sm" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="border border-dashed border-neutral-300 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            Ничего не найдено
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
            В выбранном диапазоне событий нет. Попробуйте расширить даты или
            сбросить фильтр по типу.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {groups.map(([day, items]) => (
            <div key={day} className="grid gap-2">
              <h2 className="sticky top-12 z-10 -mx-1 bg-white px-1 py-1 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 md:top-0">
                {formatDay(day)}
              </h2>
              <ul className="grid gap-2">
                {items.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(event)}
                      className="flex w-full cursor-pointer flex-col gap-2 border border-neutral-200 bg-white p-4 text-left transition-colors duration-200 hover:border-neutral-900 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <span className="w-16 shrink-0 font-mono text-sm font-semibold">
                        {event.startTime ?? "—"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {event.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                          <MapPin className="size-3" aria-hidden />
                          {event.location ?? cityName(event.city)}
                        </span>
                      </span>
                      <span className="shrink-0 border border-neutral-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                        {EVENT_TYPE_NAMES[event.type]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-sm font-mono text-[11px] uppercase tracking-[0.15em]"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Назад
              </Button>
              <span className="font-mono text-xs text-neutral-500">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm font-mono text-[11px] uppercase tracking-[0.15em]"
              >
                Вперёд
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Карточка события */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="rounded-sm sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  {EVENT_TYPE_NAMES[selected.type]}
                </p>
                <DialogTitle className="text-xl font-black leading-snug">
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <dl className="grid gap-3 border-y border-neutral-200 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0" aria-hidden />
                  <span className="capitalize">
                    {fullDateFmt.format(new Date(`${selected.eventDate}T12:00:00`))}
                  </span>
                  {selected.startTime && (
                    <span className="font-mono">· {selected.startTime}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  <span>
                    {cityName(selected.city)}
                    {selected.location ? ` — ${selected.location}` : ""}
                  </span>
                </div>
              </dl>
              <p className="text-sm leading-relaxed text-neutral-600">
                {selected.description}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
