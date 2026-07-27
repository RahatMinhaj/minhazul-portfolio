import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const analyticsRepository = {
  getEnabledSetting() {
    return getDatabase().siteSettings.findFirst({
      select: { analyticsEnabled: true },
    });
  },

  createEvent(data: Prisma.VisitorEventUncheckedCreateInput) {
    return getDatabase().visitorEvent.create({ data });
  },
};
