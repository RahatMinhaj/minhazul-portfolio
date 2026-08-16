import { z } from "zod";

import { SIMPLE_ICON_PREFIX } from "@/lib/skill-icons";

const externalIconUrlSchema = z
  .string()
  .max(2000)
  .regex(/^https?:\/\//, "Use an HTTP or HTTPS image URL.")
  .pipe(z.url());

export const skillIconSchema = z.union([
  z
    .string()
    .regex(
      new RegExp(`^${SIMPLE_ICON_PREFIX}[a-z0-9]+$`),
      "Select a valid library icon.",
    ),
  externalIconUrlSchema,
  z.string().regex(/^\/api\/media\/[0-9a-f-]{36}$/),
  z.literal(""),
]);

export function normalizeSkillSlug(value: string, fallbackName: string) {
  return (value.trim() || fallbackName.trim())
    .toLowerCase()
    .replace(/#/g, "-sharp")
    .replace(/\+/g, "-plus")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
