import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  answerPortfolioQuestion,
  ChatRateLimitError,
  ChatUnavailableError,
} from "@/features/chat/chat.service";
import { env } from "@/config/env";
import { isSameOriginRequest } from "@/lib/http/same-origin";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  CHAT_SESSION_COOKIE,
  getOrCreateChatSession,
  addChatTurn,
} from "@/features/chat/chat.session";

const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .max(6)
    .default([]),
});

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return response({ message: "JSON content is required." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return response({ message: "Request is too large." }, 413);
  }

  if (!isSameOriginRequest(request, env.NEXT_PUBLIC_SITE_URL)) {
    return response({ message: "Cross-origin requests are not allowed." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response({ message: "Invalid JSON request." }, 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return response(
      { message: "Enter a question of up to 500 characters." },
      400,
    );
  }

  const clientIdentifier =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";

  try {
    const result = await answerPortfolioQuestion({
      allowDuringMaintenance: Boolean(await getCurrentAdmin()),
      clientIdentifier,
      history: parsed.data.history,
      question: parsed.data.question,
    });

    let sessionToken: string | null = null;
    try {
      const cookieStore = await cookies();
      const existingToken = cookieStore.get(CHAT_SESSION_COOKIE)?.value ?? null;
      const sessionResult = await getOrCreateChatSession({
        sessionToken: existingToken,
        clientIdentifier,
      });

      if ("newToken" in sessionResult) {
        sessionToken = sessionResult.newToken;
      }

      await addChatTurn({
        sessionId: sessionResult.id,
        role: "user",
        content: parsed.data.question,
      });

      await addChatTurn({
        sessionId: sessionResult.id,
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        provider: "ai",
      });
    } catch (error) {
      console.error("Failed to persist chat session", error);
    }

    const httpResponse = response(result, 200);

    if (sessionToken) {
      httpResponse.cookies.set(CHAT_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return httpResponse;
  } catch (error) {
    if (error instanceof ChatRateLimitError) {
      return NextResponse.json(
        {
          message: "The hourly chat limit has been reached. Please try later.",
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }
    if (error instanceof ChatUnavailableError) {
      return response(
        { message: "Portfolio chat is currently unavailable." },
        503,
      );
    }

    console.error("Portfolio chat request failed", error);
    return response(
      {
        message: "The AI service could not answer right now. Please try again.",
      },
      502,
    );
  }
}

function response(body: object, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
