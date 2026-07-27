import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const settingsRepository = {
  findTheme(id: string) {
    return getDatabase().themeDefinition.findUnique({ where: { id } });
  },

  setDefaultTheme(id: string) {
    const database = getDatabase();
    return database.$transaction([
      database.themeDefinition.updateMany({ data: { isDefault: false } }),
      database.themeDefinition.update({
        where: { id },
        data: { isDefault: true, active: true },
      }),
    ]);
  },

  setThemeActive(id: string, active: boolean) {
    return getDatabase().themeDefinition.update({
      where: { id },
      data: { active },
    });
  },

  deleteMessage(id: string) {
    return getDatabase().contactMessage.delete({ where: { id } });
  },

  updateMessage(id: string, data: Prisma.ContactMessageUncheckedUpdateInput) {
    return getDatabase().contactMessage.update({ where: { id }, data });
  },

  findSettingsIdentity() {
    return getDatabase().siteSettings.findFirst({ select: { id: true } });
  },

  createSettings(data: Prisma.SiteSettingsUncheckedCreateInput) {
    return getDatabase().siteSettings.create({ data });
  },

  updateSettings(id: string, data: Prisma.SiteSettingsUncheckedUpdateInput) {
    return getDatabase().siteSettings.update({ where: { id }, data });
  },
};
