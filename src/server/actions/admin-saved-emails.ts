"use server";

import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export async function getSavedEmails(): Promise<string[]> {
  await requireAdmin();
  const { getDatabase } = await import("@/lib/db/client");
  const db = getDatabase();

  type SavedEmailRow = { email: string };
  const rows = await db.$queryRaw<SavedEmailRow[]>`
    SELECT email FROM "SavedEmail" ORDER BY "useCount" DESC, "updatedAt" DESC LIMIT 20
  `;
  return rows.map((r) => r.email);
}

export async function saveSentEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return failure("Invalid email address.");

  const { getDatabase } = await import("@/lib/db/client");
  const db = getDatabase();

  await db.$executeRaw`
    INSERT INTO "SavedEmail" ("id", "email", "useCount", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${email}, 1, NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET
      "useCount" = "SavedEmail"."useCount" + 1,
      "updatedAt" = NOW()
  `;

  return success("Email saved.");
}

export async function deleteSavedEmail(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return failure("Invalid email.");

  const { getDatabase } = await import("@/lib/db/client");
  const db = getDatabase();

  await db.$executeRaw`DELETE FROM "SavedEmail" WHERE "email" = ${email}`;
  return success("Email removed.");
}
