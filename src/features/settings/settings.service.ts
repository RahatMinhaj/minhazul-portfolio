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

  await settingsRepository.updateMessage(
    id,
    intent === "ARCHIVED"
      ? { status: intent }
      : { status: intent, readAt: new Date() },
  );
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
