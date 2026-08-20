import "server-only";

import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/$/, "")),
  AUTH_SECRET: z
    .string()
    .trim()
    .min(32, "AUTH_SECRET must contain at least 32 characters."),
  ADMIN_USERNAME: z.string().trim().min(1).default("admin"),
  ADMIN_EMAIL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().email().optional(),
  ),
  DATABASE_URL: optionalNonEmptyString,
  GEMINI_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(20).optional(),
  ),
  GEMINI_MODEL: z.string().trim().min(1).default("gemini-3.1-flash-lite"),
  OPENROUTER_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(20).optional(),
  ),
  OPENROUTER_MODEL: z.string().trim().min(1).default("openrouter/free"),
  SMTP_HOST: optionalNonEmptyString,
  SMTP_PORT: optionalNonEmptyString,
  SMTP_USERNAME: optionalNonEmptyString,
  SMTP_PASSWORD: optionalNonEmptyString,
  SMTP_SECURE: optionalNonEmptyString,
  SMTP_FROM_EMAIL: optionalNonEmptyString,
  SMTP_FROM_NAME: optionalNonEmptyString,
});

const parsedEnvironment = serverEnvironmentSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  DATABASE_URL: process.env.DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
});

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid environment configuration: ${z.prettifyError(parsedEnvironment.error)}`,
  );
}

export const env = parsedEnvironment.data;
