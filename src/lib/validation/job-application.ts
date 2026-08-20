import { z } from "zod";

export const jobApplicationCreateSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required.").max(200),
  roleTitle: z.string().trim().min(1, "Role title is required.").max(200),
  recipientEmail: z
    .union([z.email(), z.literal("")])
    .transform((v) => v || null),
  contactName: z.string().trim().max(200).optional().default(""),
  sourceUrl: z.union([z.url(), z.literal("")]).transform((v) => v || null),
  circularContent: z
    .string()
    .trim()
    .min(20, "Job circular must be at least 20 characters.")
    .max(100_000),
  jobDescription: z
    .string()
    .trim()
    .min(20, "Job description must be at least 20 characters.")
    .max(100_000),
  tone: z.string().trim().max(100).optional().default(""),
  notes: z.string().trim().max(5000).optional().default(""),
});

export const jobApplicationUpdateSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required.").max(200),
  roleTitle: z.string().trim().min(1, "Role title is required.").max(200),
  recipientEmail: z
    .union([z.email(), z.literal("")])
    .transform((v) => v || null),
  contactName: z.string().trim().max(200).optional().default(""),
  sourceUrl: z.union([z.url(), z.literal("")]).transform((v) => v || null),
  circularContent: z.string().trim().max(100_000).optional().default(""),
  jobDescription: z
    .string()
    .trim()
    .min(20, "Job description must be at least 20 characters.")
    .max(100_000),
  tone: z.string().trim().max(100).optional().default(""),
  notes: z.string().trim().max(5000).optional().default(""),
});

export const jobApplicationSchema = jobApplicationCreateSchema;

export type JobApplicationInput = z.infer<typeof jobApplicationCreateSchema>;

export const artifactSchema = z.object({
  kind: z.string().min(1),
  customKind: z.string().max(100).optional().default(""),
  title: z.string().max(200).optional().default(""),
  content: z.string().max(50_000),
  format: z.enum(["MARKDOWN", "TEXT"]).default("MARKDOWN"),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export type ArtifactInput = z.infer<typeof artifactSchema>;
