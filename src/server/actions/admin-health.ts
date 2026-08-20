"use server";

import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

export type HealthCheckResult = {
  name: string;
  status: "ok" | "error" | "not_configured";
  message: string;
};

export async function testDatabaseAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    const { getDatabase } = await import("@/lib/db/client");
    const db = getDatabase();
    await db.$queryRaw`SELECT 1`;
    return success("Database connection OK.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Database failed: ${message}`);
  }
}

export async function testSmtpAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;
    if (!host || !port || !username || !password) {
      return failure("SMTP is not configured. Check SMTP_* env variables.");
    }
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: username, pass: password },
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
    });
    await transport.verify();
    return success(`SMTP OK (${host}:${port}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`SMTP failed: ${message}`);
  }
}

export async function testGeminiAction(): Promise<ActionState> {
  await requireAdmin();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return failure("Gemini is not configured. Set GEMINI_API_KEY.");
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Reply with only the word OK." }] }],
          generationConfig: { maxOutputTokens: 10, temperature: 0 },
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      return failure(`Gemini failed (${response.status}): ${payload?.error?.message ?? "Unknown error"}`);
    }
    return success(`Gemini OK (model: ${model}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Gemini failed: ${message}`);
  }
}

export async function testOpenRouterAction(): Promise<ActionState> {
  await requireAdmin();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return failure("OpenRouter is not configured. Set OPENROUTER_API_KEY.");
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-OpenRouter-Title": "Health Check",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with only the word OK." }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      return failure(`OpenRouter failed (${response.status}): ${payload?.error?.message ?? "Unknown error"}`);
    }
    return success(`OpenRouter OK (model: ${model}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`OpenRouter failed: ${message}`);
  }
}
