import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getDatabase } from "@/lib/db/client";
import type { ChatTurnRole, Prisma } from "@/generated/prisma/client";

export const CHAT_SESSION_COOKIE = "chat-session";

function hashClientIdentifier(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  return createHash("sha256").update(`${secret}:${token}`).digest("hex");
}

export async function getOrCreateChatSession({
  sessionToken,
  clientIdentifier,
}: {
  sessionToken: string | null;
  clientIdentifier: string;
}) {
  const database = getDatabase();
  const clientHash = hashClientIdentifier(clientIdentifier);

  if (sessionToken) {
    const tokenHash = hashSessionToken(sessionToken);
    const existing = await database.chatSession.findUnique({
      where: { sessionToken: tokenHash },
    });
    if (existing) return existing;
  }

  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const session = await database.chatSession.create({
    data: {
      sessionToken: tokenHash,
      clientHash,
    },
  });

  return { ...session, newToken: token };
}

export async function addChatTurn({
  sessionId,
  role,
  content,
  sources,
  provider,
  model,
  status,
}: {
  sessionId: string;
  role: ChatTurnRole;
  content: string;
  sources?: unknown;
  provider?: string;
  model?: string;
  status?: string;
}) {
  const database = getDatabase();
  const turnData: {
    sessionId: string;
    role: ChatTurnRole;
    content: string;
    status: string;
    sources?: Prisma.InputJsonValue;
    provider?: string;
    model?: string;
  } = {
    sessionId,
    role,
    content,
    status: status ?? "completed",
  };

  if (sources !== undefined) turnData.sources = sources as Prisma.InputJsonValue;
  if (provider !== undefined) turnData.provider = provider;
  if (model !== undefined) turnData.model = model;

  const turn = await database.chatTurn.create({
    data: turnData,
  });

  await database.chatSession.update({
    where: { id: sessionId },
    data: {
      messageCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  return turn;
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

export async function getAdminChatSessionById(id: string) {
  const database = getDatabase();
  return database.chatSession.findUnique({
    where: { id },
    include: {
      turns: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function deleteChatSession(id: string) {
  const database = getDatabase();
  await database.chatSession.delete({ where: { id } });
}
