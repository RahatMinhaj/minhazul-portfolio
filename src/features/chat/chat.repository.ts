import "server-only";

import { createHmac } from "node:crypto";

import { env } from "@/config/env";
import type { ChatTurnRole, Prisma } from "@/generated/prisma/client";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

const CHAT_WINDOW_MS = 60 * 60 * 1000;
const CHAT_REQUEST_LIMIT = 12;

export function chatPersistenceIsAvailable() {
  return isDatabaseConfigured();
}

export async function consumeChatQuota(identifier: string) {
  const keyHash = createHmac("sha256", env.AUTH_SECRET)
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

export function findChatSessionByTokenHash(tokenHash: string) {
  return getDatabase().chatSession.findUnique({
    where: { sessionToken: tokenHash },
  });
}

export function createChatSession(data: {
  sessionToken: string;
  clientHash: string;
}) {
  return getDatabase().chatSession.create({ data });
}

export function createChatTurn(data: {
  sessionId: string;
  role: ChatTurnRole;
  content: string;
  status: string;
  sources?: Prisma.InputJsonValue;
  provider?: string;
  model?: string;
}) {
  return getDatabase().chatTurn.create({ data });
}

export function incrementChatSessionMessageCount(sessionId: string) {
  return getDatabase().chatSession.update({
    where: { id: sessionId },
    data: {
      messageCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });
}

export async function getAdminChatSessions({
  search,
  status,
  page,
  pageSize,
}: {
  search: string | undefined;
  status: string | undefined;
  page: number;
  pageSize: number;
}) {
  const database = getDatabase();
  const where: Record<string, unknown> = {};

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.turns = {
      some: {
        content: { contains: search, mode: "insensitive" },
      },
    };
  }

  const [sessions, total] = await Promise.all([
    database.chatSession.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
    database.chatSession.count({ where }),
  ]);

  return { sessions, total, page, pageSize };
}

export function getAdminChatSessionById(id: string) {
  return getDatabase().chatSession.findUnique({
    where: { id },
    include: {
      turns: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function deleteChatSession(id: string) {
  await getDatabase().chatSession.delete({ where: { id } });
}
