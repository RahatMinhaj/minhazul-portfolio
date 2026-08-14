"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  saveSiteSettings,
  updateContactMessage,
  updateTheme,
} from "@/features/settings/settings.service";
import { requireAdmin } from "@/lib/auth/session";
import { failure, idSchema, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export async function updateThemeAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: idSchema,
      intent: z.enum(["toggle", "default"]),
    })
    .safeParse({
      id: formData.get("id"),
      intent: formData.get("intent"),
    });
  if (!parsed.success) return failure("Invalid theme update.");

  const result = await updateTheme(parsed.data.id, parsed.data.intent);
  if (!result.ok) return failure(result.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/themes");
  return success(result.message);
}

export async function updateMessageAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: idSchema,
      intent: z.enum(["READ", "REPLIED", "ARCHIVED", "DELETE"]),
    })
    .safeParse({
      id: formData.get("id"),
      intent: formData.get("intent"),
    });
  if (!parsed.success) return failure("Invalid message update.");

  const message = await updateContactMessage(
    parsed.data.id,
    parsed.data.intent,
  );

  revalidatePath("/admin/contact-messages");
  revalidatePath("/admin");
  return success(message);
}

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(120),
  siteDescription: z.string().trim().min(20).max(500),
  defaultTheme: z.string().trim().min(2).max(80),
  footerText: z.string().trim().max(500),
  resumeUrl: z.union([z.url(), z.literal("")]),
  seoTitle: z.string().trim().max(160),
  seoDescription: z.string().trim().max(500),
  engineeringSectionLabel: z.string().trim().min(2).max(80),
  engineeringLinkLabel: z.string().trim().min(2).max(80),
  engineeringCoreLabel: z.string().trim().min(2).max(80),
  engineeringInventoryLabel: z.string().trim().min(2).max(80),
  engineeringScrollLabel: z.string().trim().min(2).max(80),
});

export async function saveSettingsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    defaultTheme: formData.get("defaultTheme"),
    footerText: formData.get("footerText"),
    resumeUrl: formData.get("resumeUrl"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    engineeringSectionLabel: formData.get("engineeringSectionLabel"),
    engineeringLinkLabel: formData.get("engineeringLinkLabel"),
    engineeringCoreLabel: formData.get("engineeringCoreLabel"),
    engineeringInventoryLabel: formData.get("engineeringInventoryLabel"),
    engineeringScrollLabel: formData.get("engineeringScrollLabel"),
  });
  if (!parsed.success) return failure("Site-settings validation failed.");

  const data = {
    ...parsed.data,
    footerText: parsed.data.footerText || null,
    resumeUrl: parsed.data.resumeUrl || null,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
    contactEnabled: formData.get("contactEnabled") === "on",
    blogEnabled: formData.get("blogEnabled") === "on",
    playgroundEnabled: formData.get("playgroundEnabled") === "on",
    analyticsEnabled: formData.get("analyticsEnabled") === "on",
    maintenanceMode: formData.get("maintenanceMode") === "on",
  };
  await saveSiteSettings(data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return success("Site settings saved.");
}
