import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { env } from "@/config/env";
import type { ChatTurnRole, Prisma } from "@/generated/prisma/client";
import {
  createChatSession,
  createChatTurn,
  deleteChatSession as deleteChatSessionRecord,
  findChatSessionByTokenHash,
  incrementChatSessionMessageCount,
} from "@/features/chat/chat.repository";

export const CHAT_SESSION_COOKIE = "chat-session";

function hashClientIdentifier(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(`${env.AUTH_SECRET}:${token}`)
    .digest("hex");
}

export async function getOrCreateChatSession({
  sessionToken,
  clientIdentifier,
}: {
  sessionToken: string | null;
  clientIdentifier: string;
}) {
  const clientHash = hashClientIdentifier(clientIdentifier);

  if (sessionToken) {
    const tokenHash = hashSessionToken(sessionToken);
    const existing = await findChatSessionByTokenHash(tokenHash);
    if (existing) return existing;
  }

  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const session = await createChatSession({
    sessionToken: tokenHash,
    clientHash,
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

  const turn = await createChatTurn(turnData);
  await incrementChatSessionMessageCount(sessionId);

  return turn;
}

export function deleteChatSession(id: string) {
  return deleteChatSessionRecord(id);
}
