import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForDatabase = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("Database access is unavailable because DATABASE_URL is not set.");
    this.name = "DatabaseConfigurationError";
  }
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase() {
  if (globalForDatabase.prismaClient) {
    return globalForDatabase.prismaClient;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseConfigurationError();
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
  });
  const client = new PrismaClient({ adapter });

  globalForDatabase.prismaClient = client;

  return client;
}
