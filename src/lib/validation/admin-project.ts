import { z } from "zod";

import {
  isRichTextDocument,
  parseRichTextDocument,
  type RichTextDocument,
} from "@/lib/content/rich-text";

export const projectStatuses = [
  "DRAFT",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const projectFormFieldNames = [
  "id",
  "title",
  "slug",
  "shortDescription",
  "richDescription",
  "problemStatement",
  "solution",
  "architecture",
  "challenges",
  "outcomes",
  "projectType",
  "clientName",
  "companyName",
  "role",
  "status",
  "sortOrder",
  "startDate",
  "endDate",
  "githubUrl",
  "liveUrl",
  "technologies",
  "featured",
  "visible",
] as const;

const optionalText = (maximum: number) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(maximum),
    )
    .transform((value) => value || null);

const optionalUrl = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.union([
      z.literal(""),
      z
        .url("Enter a valid absolute URL.")
        .refine((value) => /^https?:\/\//i.test(value), {
          message: "URL must use http:// or https://.",
        }),
    ]),
  )
  .transform((value) => value || null);

const optionalDate = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.union([z.literal(""), z.iso.date("Enter a valid date.")]),
  )
  .transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : null));

const richTextDocument = z.preprocess(
  parseRichTextDocument,
  z.custom<RichTextDocument>(
    (value) => isRichTextDocument(value),
    "Unsupported rich-text content.",
  ),
);

export const projectFormSchema = z
  .object({
    id: z.union([z.cuid(), z.literal("")]),
    title: z
      .string()
      .trim()
      .min(2, "Title must contain at least 2 characters.")
      .max(200, "Title must contain no more than 200 characters."),
    slug: z
      .string()
      .trim()
      .min(2, "Slug must contain at least 2 characters.")
      .max(120, "Slug must contain no more than 120 characters.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: "Use lowercase letters, numbers, and single hyphens only.",
      }),
    shortDescription: z
      .string()
      .trim()
      .min(20, "Short description must contain at least 20 characters.")
      .max(500, "Short description must contain no more than 500 characters."),
    richDescription: richTextDocument,
    problemStatement: richTextDocument,
    solution: richTextDocument,
    architecture: richTextDocument,
    challenges: richTextDocument,
    outcomes: richTextDocument,
    projectType: optionalText(120),
    clientName: optionalText(200),
    companyName: optionalText(200),
    role: optionalText(160),
    status: z.enum(projectStatuses),
    sortOrder: z.coerce.number().int().min(0).max(10_000),
    startDate: optionalDate,
    endDate: optionalDate,
    githubUrl: optionalUrl,
    liveUrl: optionalUrl,
    technologies: z.preprocess(
      (value) => readStringList(value),
      z.array(z.string().max(80)).max(50),
    ),
    featured: z.boolean(),
    visible: z.boolean(),
  })
  .superRefine((project, context) => {
    if (
      project.startDate &&
      project.endDate &&
      project.endDate < project.startDate
    ) {
      context.addIssue({
        code: "custom",
        message: "End date cannot be earlier than the start date.",
        path: ["endDate"],
      });
    }
  });

export type ProjectFormValues = z.output<typeof projectFormSchema>;

export function parseProjectFormData(formData: FormData) {
  return projectFormSchema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    richDescription: formData.get("richDescription"),
    problemStatement: formData.get("problemStatement"),
    solution: formData.get("solution"),
    architecture: formData.get("architecture"),
    challenges: formData.get("challenges"),
    outcomes: formData.get("outcomes"),
    projectType: formData.get("projectType"),
    clientName: formData.get("clientName"),
    companyName: formData.get("companyName"),
    role: formData.get("role"),
    status: formData.get("status"),
    sortOrder: formData.get("sortOrder") ?? 0,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    githubUrl: formData.get("githubUrl"),
    liveUrl: formData.get("liveUrl"),
    technologies: formData.get("technologies"),
    featured: formData.get("featured") === "on",
    visible: formData.get("visible") === "on",
  });
}

export function getProjectValidationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Project validation failed.";

  const field = String(issue.path[0] ?? "project")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return `Project validation failed: ${field} - ${issue.message}`;
}

function readStringList(value: unknown) {
  if (typeof value !== "string") return [];
  return [
    ...new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
