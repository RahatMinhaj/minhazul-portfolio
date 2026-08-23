import { z } from "zod";

export const HERO_CODE_COLORS = [
  { id: "cyan", label: "Cyan", textClass: "text-cyan-300", swatchClass: "bg-cyan-400" },
  { id: "amber", label: "Amber", textClass: "text-amber-200", swatchClass: "bg-amber-300" },
  {
    id: "emerald",
    label: "Emerald",
    textClass: "text-emerald-300",
    swatchClass: "bg-emerald-400",
  },
  {
    id: "violet",
    label: "Violet",
    textClass: "text-violet-300",
    swatchClass: "bg-violet-400",
  },
  { id: "rose", label: "Rose", textClass: "text-rose-300", swatchClass: "bg-rose-400" },
  { id: "sky", label: "Sky", textClass: "text-sky-300", swatchClass: "bg-sky-400" },
  {
    id: "orange",
    label: "Orange",
    textClass: "text-orange-300",
    swatchClass: "bg-orange-400",
  },
  { id: "pink", label: "Pink", textClass: "text-pink-300", swatchClass: "bg-pink-400" },
] as const;

export type HeroCodeColor = (typeof HERO_CODE_COLORS)[number]["id"];

export const heroCodeColorSchema = z.enum(
  HERO_CODE_COLORS.map((color) => color.id) as [
    HeroCodeColor,
    ...HeroCodeColor[],
  ],
);

const heroCodeColorById = Object.fromEntries(
  HERO_CODE_COLORS.map((color) => [color.id, color]),
) as Record<HeroCodeColor, (typeof HERO_CODE_COLORS)[number]>;

export function getHeroCodeColorTextClass(color: HeroCodeColor | undefined) {
  return heroCodeColorById[color ?? "cyan"].textClass;
}

export function getDefaultHeroCodeColor(
  value: HeroCodeProperty["value"],
): HeroCodeColor {
  if (typeof value === "string") return "amber";
  return "emerald";
}

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
  color: heroCodeColorSchema.optional(),
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
      { key: "name", value: "Minhazul Islam", color: "amber" },
      { key: "focus", value: "enterprise + AI", color: "cyan" },
      { key: "projects", value: 4, color: "emerald" },
      { key: "status", value: "building", color: "violet" },
    ],
  },
};

export function parseHeroContent(value: unknown): HeroContent {
  const parsed = heroContentSchema.safeParse(value);
  if (parsed.success) {
    return {
      developerCode: {
        ...parsed.data.developerCode,
        properties: parsed.data.developerCode.properties.map((property) => ({
          ...property,
          color: property.color ?? getDefaultHeroCodeColor(property.value),
        })),
      },
    };
  }

  const legacy = legacyHeroContentSchema.safeParse(value);
  if (!legacy.success) return defaultHeroContent;

  const { developerCode } = legacy.data;
  const migrated = heroContentSchema.safeParse({
    developerCode: {
      fileLabel: developerCode.fileLabel,
      variableName: developerCode.variableName,
      properties: [
        { key: "name", value: "Minhazul Islam", color: "amber" },
        { key: "focus", value: developerCode.focus, color: "cyan" },
        { key: "projects", value: 4, color: "emerald" },
        { key: "status", value: developerCode.status, color: "violet" },
        ...developerCode.additionalProperties.map((property) => ({
          ...property,
          color: property.color ?? getDefaultHeroCodeColor(property.value),
        })),
      ],
    },
  });

  return migrated.success ? migrated.data : defaultHeroContent;
}
