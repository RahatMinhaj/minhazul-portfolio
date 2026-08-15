"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteProject,
  saveProject,
} from "@/features/projects/project.service";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import {
  getProjectValidationMessage,
  parseProjectFormData,
} from "@/lib/validation/admin-project";
import {
  failure,
  idSchema,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export async function saveProjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProjectFormData(formData);
  if (!parsed.success) return failure(getProjectValidationMessage(parsed.error));

  const { id, ...values } = parsed.data;
  try {
    await saveProject(id, values);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return failure("A project with this slug already exists.");
    }
    throw error;
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${values.slug}`);
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
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
