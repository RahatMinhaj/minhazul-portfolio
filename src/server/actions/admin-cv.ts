"use server";

import { revalidatePath } from "next/cache";

import { deleteCv, replaceCv } from "@/features/cv/cv-storage";
import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export async function uploadCvAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("cv");

  if (!(file instanceof File)) return failure("Select a PDF to upload.");

  try {
    await replaceCv(file);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "The CV could not be uploaded.",
    );
  }

  revalidatePath("/resume");
  revalidatePath("/admin/cv");
  return success("CV uploaded. The previous file has been replaced.");
}

export async function deleteCvAction(
  _state: ActionState,
): Promise<ActionState> {
  void _state;
  await requireAdmin();

  try {
    await deleteCv();
  } catch {
    return failure("The CV could not be deleted.");
  }

  revalidatePath("/resume");
  revalidatePath("/admin/cv");
  return success("CV deleted.");
}
