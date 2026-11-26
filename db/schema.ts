import {
  mysqlTable,
  mysqlEnum,
  bigint,
  int,
  varchar,
  text,
  timestamp,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  // Город проживания из фиксированного справочника (contracts/cities.ts).
  city: varchar("city", { length: 32 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Гараж: автомобили пользователя. Удаляются каскадом вместе с владельцем.
export const cars = mysqlTable(
  "cars",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    brand: varchar("brand", { length: 120 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    year: int("year").notNull(),
    plateNumber: varchar("plateNumber", { length: 16 }).notNull(),
    // NOT NULL без DEFAULT: TiDB не поддерживает дефолт для TEXT,
    // значение "" всегда проставляет приложение (zod default в carInputSchema).
    description: text("description").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("cars_userId_idx").on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "cars_userId_fk",
    }).onDelete("cascade"),
  ],
);

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

// Календарь событий. Наполняется из источника (MVP — mock, см. api/events/).
// externalId — идемпотентный ключ записи во внешнем источнике.
export const events = mysqlTable(
  "events",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    externalId: varchar("externalId", { length: 64 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    // Дата строкой YYYY-MM-DD — без сюрпризов таймзон при сериализации.
    eventDate: varchar("eventDate", { length: 10 }).notNull(),
    startTime: varchar("startTime", { length: 5 }),
    city: varchar("city", { length: 32 }).notNull(),
    type: mysqlEnum("type", [
      "MEETUP",
      "EXHIBITION",
      "RALLY",
      "FESTIVAL",
      "OTHER",
    ]).notNull(),
    location: varchar("location", { length: 255 }),
    // NOT NULL без DEFAULT: TiDB не поддерживает дефолт для TEXT (как cars.description).
    description: text("description").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Основной запрос календаря: события города за период.
    index("events_city_date_idx").on(table.city, table.eventDate),
  ],
);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
