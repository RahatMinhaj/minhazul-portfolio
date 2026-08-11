import { z } from "zod";

export const heroDeveloperCodeSchema = z.object({
  fileLabel: z.string().trim().min(1).max(80),
  variableName: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
  focus: z.string().trim().min(1).max(120),
  status: z.string().trim().min(1).max(80),
});

const heroContentSchema = z.object({
  developerCode: heroDeveloperCodeSchema,
});

export type HeroContent = z.infer<typeof heroContentSchema>;

export const defaultHeroContent: HeroContent = {
  developerCode: {
    fileLabel: "minhazul.profile.ts",
    variableName: "developer",
    focus: "enterprise + AI",
    status: "building",
  },
};

export function parseHeroContent(value: unknown): HeroContent {
  const parsed = heroContentSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultHeroContent;
}
