"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteProject,
  saveProject,
} from "@/features/projects/project.service";
import { requireAdmin } from "@/lib/auth/session";
import {
  failure,
  idSchema,
  optionalUrlSchema,
  parseOptionalDate,
  readStringList,
  slugSchema,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const projectSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  title: z.string().trim().min(2).max(200),
  slug: slugSchema,
  shortDescription: z.string().trim().min(20).max(500),
  projectType: z.string().trim().max(120),
  role: z.string().trim().max(160),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]),
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveProjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = projectSchema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    projectType: formData.get("projectType"),
    role: formData.get("role"),
    status: formData.get("status"),
    githubUrl: formData.get("githubUrl") ?? "",
    liveUrl: formData.get("liveUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Project validation failed.");

  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    projectType: values.projectType || null,
    role: values.role || null,
    startDate: parseOptionalDate(formData.get("startDate")),
    endDate: parseOptionalDate(formData.get("endDate")),
    technologies: readStringList(formData.get("technologies")),
    featured: formData.get("featured") === "on",
    visible: formData.get("visible") === "on",
  };

  await saveProject(id, data);

  revalidatePath("/projects");
  revalidatePath(`/projects/${values.slug}`);
  revalidatePath("/admin/projects");
  return success("Project saved.");
}

export async function deleteProjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid project record.");
  await deleteProject(id.data);
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return success("Project deleted.");
}
