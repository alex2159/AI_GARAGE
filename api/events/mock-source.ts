import { CITIES } from "@contracts/cities";
import { EVENT_TYPES } from "@contracts/events";
import type { EventSourcePort, ExternalEvent } from "./source";

// Mock-источник событий для MVP: детерминированный набор реалистичных
// событий по всем городам справочника и всем типам. Даты считаются
// смещениями от дня запуска сида, чтобы календарь всегда был наполнен
// «вокруг сегодня»: прошедшая неделя, сегодня и месяц вперёд.

const TITLES: Record<(typeof EVENT_TYPES)[number], string[]> = {
  MEETUP: [
    "Встреча клуба ретро-автомобилей",
    "Вечер открытых гаражей",
    "Клубный смотр классики",
  ],
  EXHIBITION: [
    "Выставка советского автопрома",
    "Экспозиция «Отечественная классика»",
  ],
  RALLY: ["Ралли регулярности «Классик тур»", "Городской ретро-пробег"],
  FESTIVAL: ["Фестиваль ретро-техники", "День открытых дверей музея техники"],
  OTHER: ["Лекция о реставрации кузовов", "Своп-встреча: обмен запчастями"],
};

const LOCATIONS: Record<string, string[]> = {
  MOSCOW: ["ВДНХ, павильон «Транспорт»", "Музейный комплекс, МХК", "Парк Горького, центральная аллея"],
  SAINT_PETERSBURG: ["Крестовский остров, парковка Ю", "Севкабель Порт", "Площадь Островского"],
  KAZAN: ["Кремлёвская набережная", "Казань Экспо", "Парк «Чёрное озеро»"],
  NIZHNY_NOVGOROD: ["Нижегородская ярмарка", "Стрелка, набережная", "Кремль, площадь у ДК"],
};

const DESCRIPTIONS = [
  "Открытая встреча владельцев и энтузиастов ретро-автомобилей. Можно прийти со своей машиной или просто посмотреть экспозицию, пообщаться с владельцами и обменяться опытом обслуживания.",
  "Показ отреставрированных автомобилей отечественного и зарубежного производства. Участие бесплатное, регистрация на месте. Для авто старше 30 лет — отдельная экспозиционная зона.",
  "Дружеский заезд по городу без спортивного регламента. Маршрут 40–60 км, финиш — общая фотосессия и чаепитие. Обязателен исправный тормозной путь и хорошее настроение.",
  "Семейное мероприятие: выставка техники, зона реставрационных мастерских, лекторий и ярмарка автолитературы. Вход свободный, парковка для ретро-авто отдельная.",
  "Практическая встреча: разбор типовых проблем, обмен контактами проверенных мастерских и поставщиков запчастей. Приносите свои вопросы и находки.",
];

function datePlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Смещения дат для 7 событий каждого города: неделя назад … месяц вперёд.
const OFFSETS = [-7, -1, 0, 2, 6, 14, 30] as const;
const START_TIMES = ["10:00", "12:00", "18:30", "11:00", "15:00", "09:00", "13:00"] as const;

export class MockEventSource implements EventSourcePort {
  readonly name = "mock";

  async fetchEvents(): Promise<ExternalEvent[]> {
    const out: ExternalEvent[] = [];
    for (const city of CITIES) {
      OFFSETS.forEach((offset, i) => {
        const type = EVENT_TYPES[(i + CITIES.indexOf(city)) % EVENT_TYPES.length];
        const titles = TITLES[type];
        const locations = LOCATIONS[city.code];
        out.push({
          externalId: `mock-${city.code.toLowerCase()}-${i}`,
          title: titles[i % titles.length],
          eventDate: datePlus(offset),
          startTime: offset < 0 ? null : START_TIMES[i],
          city: city.code,
          type,
          location: locations[i % locations.length],
          description: DESCRIPTIONS[i % DESCRIPTIONS.length],
        });
      });
    }
    return out;
  }
}
