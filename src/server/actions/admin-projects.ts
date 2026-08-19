"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteProject,
  saveProject,
} from "@/features/projects/project.service";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { richTextDocumentHasContent } from "@/lib/content/rich-text";
import {
  getProjectValidationMessage,
  parseProjectFormData,
} from "@/lib/validation/admin-project";
import { failure, idSchema, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export async function saveProjectAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProjectFormData(formData);
  if (!parsed.success)
    return failure(getProjectValidationMessage(parsed.error));

  const {
    id,
    architecture,
    challenges,
    outcomes,
    problemStatement,
    richDescription,
    solution,
    ...values
  } = parsed.data;
  const data = {
    ...values,
    architecture: jsonValue(architecture),
    challenges: jsonValue(challenges),
    outcomes: jsonValue(outcomes),
    problemStatement: jsonValue(problemStatement),
    richDescription: jsonValue(richDescription),
    solution: jsonValue(solution),
  };
  try {
    await saveProject(id, data);
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

function jsonValue(document: Parameters<typeof richTextDocumentHasContent>[0]) {
  return richTextDocumentHasContent(document)
    ? (document as Prisma.InputJsonValue)
    : Prisma.DbNull;
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
