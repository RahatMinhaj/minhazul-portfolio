import "server-only";

import { createHmac } from "node:crypto";

import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

const CHAT_WINDOW_MS = 60 * 60 * 1000;
const CHAT_REQUEST_LIMIT = 12;

export function chatPersistenceIsAvailable() {
  return isDatabaseConfigured();
}

export async function consumeChatQuota(identifier: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Chat rate limiting is not configured.");
  }

  const keyHash = createHmac("sha256", secret)
    .update(`portfolio-chat:${identifier}`)
    .digest("hex");
  const database = getDatabase();
  const now = new Date();
  const current = await database.authAttempt.findUnique({
    where: { keyHash },
  });
  const windowExpired =
    !current ||
    now.getTime() - current.windowStartedAt.getTime() >= CHAT_WINDOW_MS;

  if (windowExpired) {
    await database.authAttempt.upsert({
      where: { keyHash },
      create: {
        keyHash,
        failureCount: 1,
        windowStartedAt: now,
        blockedUntil: null,
      },
      update: {
        failureCount: 1,
        windowStartedAt: now,
        blockedUntil: null,
      },
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.failureCount >= CHAT_REQUEST_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil(
          (CHAT_WINDOW_MS -
            (now.getTime() - current.windowStartedAt.getTime())) /
            1000,
        ),
      ),
    };
  }

  const updated = await database.authAttempt.update({
    where: { keyHash },
    data: { failureCount: { increment: 1 } },
  });

  return {
    allowed: updated.failureCount <= CHAT_REQUEST_LIMIT,
    retryAfterSeconds:
      updated.failureCount <= CHAT_REQUEST_LIMIT
        ? 0
        : Math.max(
            1,
            Math.ceil(
              (CHAT_WINDOW_MS -
                (now.getTime() - updated.windowStartedAt.getTime())) /
                1000,
            ),
          ),
  };
}
