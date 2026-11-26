import { and, desc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertCar } from "@db/schema";
import { getDb } from "./connection";

export async function findCarsByUser(userId: number) {
  return getDb()
    .select()
    .from(schema.cars)
    .where(eq(schema.cars.userId, userId))
    .orderBy(desc(schema.cars.createdAt));
}

// Все операции над одним авто скоуплены владельцем: чужая запись
// неотличима от несуществующей (404, а не 403 с утечкой факта наличия).
export async function findUserCar(userId: number, carId: number) {
  const rows = await getDb()
    .select()
    .from(schema.cars)
    .where(and(eq(schema.cars.id, carId), eq(schema.cars.userId, userId)))
    .limit(1);
  return rows.at(0);
}

export async function insertCar(data: InsertCar) {
  const result = await getDb().insert(schema.cars).values(data);
  const id = Number(result[0].insertId);
  return getDb()
    .select()
    .from(schema.cars)
    .where(eq(schema.cars.id, id))
    .limit(1)
    .then((rows) => rows[0]);
}

export async function updateCar(
  userId: number,
  carId: number,
  data: Partial<Omit<InsertCar, "id" | "userId">>,
) {
  await getDb()
    .update(schema.cars)
    .set(data)
    .where(and(eq(schema.cars.id, carId), eq(schema.cars.userId, userId)));
  return findUserCar(userId, carId);
}

export async function deleteCar(userId: number, carId: number) {
  const result = await getDb()
    .delete(schema.cars)
    .where(and(eq(schema.cars.id, carId), eq(schema.cars.userId, userId)));
  return Number(result[0].affectedRows) > 0;
}
