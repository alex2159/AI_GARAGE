// Фиксированный справочник городов MVP.
// Источник истины для бэкенда (валидация профиля) и фронтенда (селект).

export const CITIES = [
  { code: "MOSCOW", name: "Москва" },
  { code: "SAINT_PETERSBURG", name: "Санкт-Петербург" },
  { code: "KAZAN", name: "Казань" },
  { code: "NIZHNY_NOVGOROD", name: "Нижний Новгород" },
] as const;

export type CityCode = (typeof CITIES)[number]["code"];

export const CITY_CODES = CITIES.map((c) => c.code) as [
  CityCode,
  ...CityCode[],
];

const nameByCode = new Map<string, string>(CITIES.map((c) => [c.code, c.name]));

export function cityName(code: string | null | undefined): string {
  if (!code) return "";
  return nameByCode.get(code) ?? code;
}

export function isCityCode(value: string): value is CityCode {
  return nameByCode.has(value);
}
