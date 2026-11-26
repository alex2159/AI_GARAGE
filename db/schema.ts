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

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
