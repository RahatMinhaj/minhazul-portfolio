import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { settingsRepository } from "@/features/settings/settings.repository";

export type ThemeUpdateResult =
  { ok: true; message: string } | { ok: false; message: string };

export async function updateTheme(
  id: string,
  intent: "toggle" | "default",
): Promise<ThemeUpdateResult> {
  const theme = await settingsRepository.findTheme(id);
  if (!theme) return { ok: false, message: "Theme not found." };

  if (intent === "default") {
    await settingsRepository.setDefaultTheme(id);
    return { ok: true, message: "Default theme updated." };
  }

  if (theme.isDefault && theme.active) {
    return {
      ok: false,
      message: "Set another default theme before disabling this one.",
    };
  }

  await settingsRepository.setThemeActive(id, !theme.active);
  return { ok: true, message: "Theme availability updated." };
}

export async function updateContactMessage(
  id: string,
  intent: "READ" | "REPLIED" | "ARCHIVED" | "DELETE",
) {
  if (intent === "DELETE") {
    await settingsRepository.deleteMessage(id);
    return "Message deleted.";
  }

  const updateData: Record<string, unknown> = { status: intent };
  if (intent === "READ") {
    updateData.readAt = new Date();
  } else if (intent === "REPLIED") {
    updateData.readAt = new Date();
    updateData.repliedAt = new Date();
  } else if (intent === "ARCHIVED") {
    updateData.archivedAt = new Date();
  }

  await settingsRepository.updateMessage(id, updateData);
  return "Message updated.";
}

export async function saveSiteSettings(
  data: Prisma.SiteSettingsUncheckedCreateInput,
) {
  const current = await settingsRepository.findSettingsIdentity();
  return current
    ? settingsRepository.updateSettings(current.id, data)
    : settingsRepository.createSettings(data);
}

export async function getEmailSignature() {
  const settings = await settingsRepository.findSettingsIdentity();
  if (!settings) return null;
  const full = await settingsRepository.findSettingsById(settings.id);
  return full?.emailSignature ?? null;
}

export async function saveEmailSignature(signature: unknown) {
  const current = await settingsRepository.findSettingsIdentity();
  if (!current) return { ok: false, message: "Settings not found." };
  await settingsRepository.updateSettings(current.id, {
    emailSignature: signature as Prisma.InputJsonValue,
  });
  return { ok: true, message: "Email signature saved." };
}
