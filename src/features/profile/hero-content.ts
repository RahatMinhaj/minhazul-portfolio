import { z } from "zod";

export const heroCodePropertySchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
  value: z.union([
    z.string().max(160),
    z.number().finite(),
    z.boolean(),
    z.null(),
  ]),
});

export const heroDeveloperCodeSchema = z.object({
  fileLabel: z.string().trim().min(1).max(80),
  variableName: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
  properties: z
    .array(heroCodePropertySchema)
    .max(16)
    .superRefine((properties, context) => {
      const keys = new Set<string>();

      properties.forEach((property, index) => {
        if (keys.has(property.key)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate property "${property.key}".`,
            path: [index, "key"],
          });
        }
        keys.add(property.key);
      });
    }),
});

const heroContentSchema = z.object({
  developerCode: heroDeveloperCodeSchema,
});

const legacyHeroContentSchema = z.object({
  developerCode: z.object({
    fileLabel: heroDeveloperCodeSchema.shape.fileLabel,
    variableName: heroDeveloperCodeSchema.shape.variableName,
    focus: z.string().trim().min(1).max(120),
    status: z.string().trim().min(1).max(80),
    additionalProperties: z.array(heroCodePropertySchema).max(12).default([]),
  }),
});

export type HeroContent = z.infer<typeof heroContentSchema>;
export type HeroCodeProperty = z.infer<typeof heroCodePropertySchema>;

export const defaultHeroContent: HeroContent = {
  developerCode: {
    fileLabel: "minhazul.profile.ts",
    variableName: "developer",
    properties: [
      { key: "name", value: "Minhazul Islam" },
      { key: "focus", value: "enterprise + AI" },
      { key: "projects", value: 4 },
      { key: "status", value: "building" },
    ],
  },
};

export function parseHeroContent(value: unknown): HeroContent {
  const parsed = heroContentSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  const legacy = legacyHeroContentSchema.safeParse(value);
  if (!legacy.success) return defaultHeroContent;

  const { developerCode } = legacy.data;
  const migrated = heroContentSchema.safeParse({
    developerCode: {
      fileLabel: developerCode.fileLabel,
      variableName: developerCode.variableName,
      properties: [
        { key: "name", value: "Minhazul Islam" },
        { key: "focus", value: developerCode.focus },
        { key: "projects", value: 4 },
        { key: "status", value: developerCode.status },
        ...developerCode.additionalProperties,
      ],
    },
  });

  return migrated.success ? migrated.data : defaultHeroContent;
}
