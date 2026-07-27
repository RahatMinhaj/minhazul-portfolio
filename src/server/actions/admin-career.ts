"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteCertification,
  deleteEducation,
  deleteExperience,
  saveCertification,
  saveEducation,
  saveExperience,
} from "@/features/career/career.service";
import { requireAdmin } from "@/lib/auth/session";
import {
  failure,
  idSchema,
  parseOptionalDate,
  readStringList,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const experienceSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  company: z.string().trim().min(2).max(160),
  position: z.string().trim().min(2).max(160),
  location: z.string().trim().max(160),
  summary: z.string().trim().max(2000),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveExperienceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse({
    id: formData.get("id") ?? "",
    company: formData.get("company"),
    position: formData.get("position"),
    location: formData.get("location"),
    summary: formData.get("summary"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });

  if (!parsed.success) return failure("Experience validation failed.");

  const data = {
    company: parsed.data.company,
    position: parsed.data.position,
    location: parsed.data.location || null,
    summary: parsed.data.summary || null,
    startDate: parseOptionalDate(formData.get("startDate")),
    endDate: parseOptionalDate(formData.get("endDate")),
    currentlyWorking: formData.get("currentlyWorking") === "on",
    achievements: readStringList(formData.get("achievements")),
    technologies: readStringList(formData.get("technologies")),
    sortOrder: parsed.data.sortOrder,
    featured: formData.get("featured") === "on",
    visible: formData.get("visible") === "on",
  };

  await saveExperience(parsed.data.id, data);

  revalidatePath("/experience");
  revalidatePath("/admin/experiences");
  return success("Experience saved.");
}

export async function deleteExperienceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid experience record.");
  await deleteExperience(id.data);
  revalidatePath("/experience");
  revalidatePath("/admin/experiences");
  return success("Experience deleted.");
}

const certificationSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  name: z.string().trim().min(2).max(200),
  issuer: z.string().trim().min(2).max(160),
  credentialId: z.string().trim().max(200),
  credentialUrl: z.union([z.url(), z.literal("")]),
  category: z.string().trim().max(100),
  description: z.string().trim().max(2000),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveCertificationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = certificationSchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name"),
    issuer: formData.get("issuer"),
    credentialId: formData.get("credentialId"),
    credentialUrl: formData.get("credentialUrl"),
    category: formData.get("category"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Certification validation failed.");

  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    credentialId: values.credentialId || null,
    credentialUrl: values.credentialUrl || null,
    category: values.category || null,
    description: values.description || null,
    issueDate: parseOptionalDate(formData.get("issueDate")),
    expiryDate: parseOptionalDate(formData.get("expiryDate")),
    featured: formData.get("featured") === "on",
    visible: formData.get("visible") === "on",
  };

  await saveCertification(id, data);
  revalidatePath("/certifications");
  revalidatePath("/admin/certifications");
  return success("Certification saved.");
}

export async function deleteCertificationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid certification record.");
  await deleteCertification(id.data);
  revalidatePath("/certifications");
  revalidatePath("/admin/certifications");
  return success("Certification deleted.");
}

const educationSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  institution: z.string().trim().min(2).max(200),
  degree: z.string().trim().min(2).max(200),
  field: z.string().trim().max(200),
  grade: z.string().trim().max(100),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveEducationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = educationSchema.safeParse({
    id: formData.get("id") ?? "",
    institution: formData.get("institution"),
    degree: formData.get("degree"),
    field: formData.get("field"),
    grade: formData.get("grade"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Education validation failed.");
  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    field: values.field || null,
    grade: values.grade || null,
    startDate: parseOptionalDate(formData.get("startDate")),
    endDate: parseOptionalDate(formData.get("endDate")),
    visible: formData.get("visible") === "on",
  };

  await saveEducation(id, data);
  revalidatePath("/education");
  revalidatePath("/admin/education");
  return success("Education record saved.");
}

export async function deleteEducationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid education record.");
  await deleteEducation(id.data);
  revalidatePath("/education");
  revalidatePath("/admin/education");
  return success("Education record deleted.");
}
