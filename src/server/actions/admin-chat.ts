"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { idSchema, failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";
import {
  deleteChatSession,
} from "@/features/chat/chat.session";

export async function deleteChatSessionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid session ID.");

  await deleteChatSession(id.data);

  revalidatePath("/admin/chat-sessions");
  return success("Session deleted.");
}
