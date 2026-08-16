import { z } from "zod";

export const optionalImageReferenceSchema = z.union([
  z.url({ protocol: /^https?$/ }),
  z
    .string()
    .trim()
    .regex(/^\/(?!\/)[a-zA-Z0-9/_\-.]+$/),
  z.literal(""),
]);

export const optionalVisualIconSchema = z.union([
  z.string().regex(/^lucide:[a-z0-9-]+$/),
  z.string().regex(/^[a-z0-9-]{1,80}$/),
  optionalImageReferenceSchema,
]);
