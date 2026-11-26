import { getDb } from "../api/queries/connection";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");
  console.log("Done.");
  void db;
  process.exit(0); // close MySQL connection pool
}

seed();
