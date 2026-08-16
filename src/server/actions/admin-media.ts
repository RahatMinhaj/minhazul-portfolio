"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { storeUploadedImage } from "@/features/media/image-storage";
import { registerMediaAsset } from "@/features/media/service";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const mediaSchema = z.object({
  provider: z.enum(["url", "local-preview"]),
  url: z.string().trim().min(1).max(2000),
  altText: z.string().trim().min(3).max(500),
});

export async function registerMediaAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = mediaSchema.safeParse({
    provider: formData.get("provider"),
    url: formData.get("url"),
    altText: formData.get("altText"),
  });
  if (!parsed.success) return failure("Media validation failed.");

  try {
    await registerMediaAsset(parsed.data.provider, parsed.data);
  } catch {
    return failure("The media path is invalid or could not be registered.");
  }
  revalidatePath("/admin/media");
  return success("Media asset registered.");
}

const uploadSchema = z.object({
  altText: z.string().trim().min(3).max(500),
});

export async function uploadMediaAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = uploadSchema.safeParse({ altText: formData.get("altText") });
  const file = formData.get("image");
  if (!parsed.success || !(file instanceof File)) {
    return failure("Select an image and provide meaningful alternative text.");
  }

  try {
    await storeUploadedImage(file, parsed.data.altText);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "The image could not be uploaded.",
    );
  }

  revalidatePath("/admin/media");
  return success("Image uploaded to server media.");
}
