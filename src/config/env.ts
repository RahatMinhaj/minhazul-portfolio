import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/$/, "")),
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
});

const parsedEnvironment = serverEnvironmentSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
});

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid environment configuration: ${z.prettifyError(parsedEnvironment.error)}`,
  );
}

export const env = parsedEnvironment.data;
