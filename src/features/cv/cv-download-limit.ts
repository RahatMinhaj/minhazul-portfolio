import "server-only";

import { createHmac } from "node:crypto";

import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

const DOWNLOAD_LIMIT = 10;
const DOWNLOAD_WINDOW_MS = 60 * 60 * 1000;

export async function registerCvDownload(request: Request) {
  if (!isDatabaseConfigured()) return { allowed: true, retryAfter: 0 };

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  const identifier = getClientIdentifier(request);
  const sessionHash = createHmac("sha256", secret)
    .update(`cv-download:${identifier}`)
    .digest("hex");
  const windowStart = new Date(Date.now() - DOWNLOAD_WINDOW_MS);
  const database = getDatabase();
  const recentDownloads = await database.visitorEvent.count({
    where: {
      eventType: "cv_download",
      sessionHash,
      createdAt: { gte: windowStart },
    },
  });

  if (recentDownloads >= DOWNLOAD_LIMIT) {
    const oldest = await database.visitorEvent.findFirst({
      where: {
        eventType: "cv_download",
        sessionHash,
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
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

  await database.visitorEvent.create({
    data: {
      eventType: "cv_download",
      pathname: "/api/resume",
      sessionHash,
    },
  });

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
