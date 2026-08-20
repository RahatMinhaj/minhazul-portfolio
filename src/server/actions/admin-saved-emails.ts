"use server";

import { z } from "zod";

import { isValidRecipientEmail } from "@/features/job-applications/saved-email";
import {
  deleteSavedRecipientEmail,
  listSavedRecipientEmails,
  rememberSavedRecipientEmail,
} from "@/features/job-applications/saved-email.service";
import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const emailSchema = z.string().trim().email().max(320);

export async function getSavedEmails(query?: string): Promise<string[]> {
  await requireAdmin();
  return listSavedRecipientEmails(query);
}

/** Persist a newly typed recipient so it appears in future suggestions. */
export async function saveSentEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success || !isValidRecipientEmail(parsed.data)) {
    return failure("Invalid email address.");
  }

  const bump = formData.get("bumpUseCount") === "1";
  const result = await rememberSavedRecipientEmail(parsed.data, {
    bumpUseCount: bump,
  });
  if (!result.ok) return failure(result.message);

  return success(
    result.created ? "Email saved for suggestions." : "Email already saved.",
    { email: result.email, created: result.created },
  );
}

export async function deleteSavedEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return failure("Invalid email.");

  await deleteSavedRecipientEmail(parsed.data);
  return success("Email removed.");
}
