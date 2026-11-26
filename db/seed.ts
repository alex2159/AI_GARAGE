import { importEvents } from "../api/events/importer";

// npx tsx db/seed.ts — идемпотентное наполнение календаря событий.
async function seed() {
  console.log("Seeding database...");
  const { inserted, total } = await importEvents();
  console.log(`Events: inserted ${inserted} of ${total} (idempotent by externalId).`);
  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
