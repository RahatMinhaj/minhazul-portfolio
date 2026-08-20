import "server-only";

import { createHmac } from "node:crypto";

import { env } from "@/config/env";
import { analyticsRepository } from "@/features/analytics/analytics.repository";
import { isDatabaseConfigured } from "@/lib/db/client";

const DOWNLOAD_LIMIT = 10;
const DOWNLOAD_WINDOW_MS = 60 * 60 * 1000;

export async function registerCvDownload(request: Request) {
  if (!isDatabaseConfigured()) return { allowed: true, retryAfter: 0 };

  const identifier = getClientIdentifier(request);
  const sessionHash = createHmac("sha256", env.AUTH_SECRET)
    .update(`cv-download:${identifier}`)
    .digest("hex");
  const windowStart = new Date(Date.now() - DOWNLOAD_WINDOW_MS);
  const recentDownloads = await analyticsRepository.countCvDownloadsSince(
    sessionHash,
    windowStart,
  );

  if (recentDownloads >= DOWNLOAD_LIMIT) {
    const oldest = await analyticsRepository.findOldestCvDownloadSince(
      sessionHash,
      windowStart,
    );
    const retryAfter = oldest
      ? Math.max(
          1,
          Math.ceil(
            (oldest.createdAt.getTime() + DOWNLOAD_WINDOW_MS - Date.now()) /
              1000,
          ),
        )
      : 60;

    return { allowed: false, retryAfter };
  }

  await analyticsRepository.createCvDownloadEvent(sessionHash);

  return { allowed: true, retryAfter: 0 };
}

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `${ip}:${request.headers.get("user-agent") ?? "unknown"}`;
}
