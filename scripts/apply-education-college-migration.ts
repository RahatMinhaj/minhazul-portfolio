import "dotenv/config";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import pg from "pg";

async function main() {
  const migrationPath = resolve(
    process.cwd(),
    "prisma/migrations/20260823140000_add_education_college/migration.sql",
  );
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = readFileSync(migrationPath, "utf8");
  const client = new pg.Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Applied education college migration.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('column "college" of relation "Education" already exists')) {
      console.log("Education.college column already exists.");
    } else {
      console.error("Failed to apply education college migration:", message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
