import { z } from "zod";

// Общие правила валидации автомобиля (бэкенд и фронтенд используют одну схему).

export const CAR_DESCRIPTION_MAX = 5000;
export const CAR_YEAR_MIN = 1900;

export const carYearMax = () => new Date().getFullYear();

// Российский госномер: А123БВ77 или А123БВ177 (регион 2–3 цифры).
// Допускаются только кириллические буквы, имеющие латинские аналоги.
export const PLATE_NUMBER_RE =
  /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/;

export function normalizePlateNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export const carInputSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, "Укажите марку")
    .max(120, "Не более 120 символов"),
  model: z
    .string()
    .trim()
    .min(1, "Укажите модель")
    .max(120, "Не более 120 символов"),
  year: z
    .number({ error: "Год должен быть числом" })
    .int("Год должен быть целым")
    .min(CAR_YEAR_MIN, `Год не раньше ${CAR_YEAR_MIN}`)
    .max(carYearMax(), `Год не позже ${carYearMax()}`),
  plateNumber: z
    .string()
    .transform(normalizePlateNumber)
    .pipe(
      z
        .string()
        .regex(
          PLATE_NUMBER_RE,
          "Формат госномера: А123БВ77 (кириллица, регион 2–3 цифры)",
        ),
    ),
  description: z
    .string()
    .max(
      CAR_DESCRIPTION_MAX,
      `Описание не более ${CAR_DESCRIPTION_MAX} символов`,
    )
    .default(""),
});

export type CarInput = z.input<typeof carInputSchema>;
export type CarParsed = z.output<typeof carInputSchema>;

export type CarDTO = {
  id: number;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};
