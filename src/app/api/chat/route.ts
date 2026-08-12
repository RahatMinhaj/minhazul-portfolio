import { NextResponse } from "next/server";
import { z } from "zod";

import {
  answerPortfolioQuestion,
  ChatRateLimitError,
  ChatUnavailableError,
} from "@/features/chat/chat.service";

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

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
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
      clientIdentifier,
      history: parsed.data.history,
      question: parsed.data.question,
    });
    return response(result, 200);
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
