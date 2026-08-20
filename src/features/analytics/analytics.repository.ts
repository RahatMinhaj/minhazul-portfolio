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

  countCvDownloadsSince(sessionHash: string, windowStart: Date) {
    return getDatabase().visitorEvent.count({
      where: {
        eventType: "cv_download",
        sessionHash,
        createdAt: { gte: windowStart },
      },
    });
  },

  findOldestCvDownloadSince(sessionHash: string, windowStart: Date) {
    return getDatabase().visitorEvent.findFirst({
      where: {
        eventType: "cv_download",
        sessionHash,
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
  },

  createCvDownloadEvent(sessionHash: string) {
    return getDatabase().visitorEvent.create({
      data: {
        eventType: "cv_download",
        pathname: "/api/resume",
        sessionHash,
      },
    });
  },
};
