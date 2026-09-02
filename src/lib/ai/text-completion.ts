import "server-only";

import { env } from "@/config/env";

export type AiProviderPreference = "auto" | "gemini" | "openrouter";

export type TextCompletion = {
  text: string;
  provider: string;
  model: string;
};

export type CompletionOptions = {
  maxOutputTokens: number;
  temperature: number;
  timeoutMs: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
};

type OpenRouterResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
  model?: string;
};

const OPENROUTER_TIMEOUT_MULTIPLIER = 2;
const OPENROUTER_MIN_TIMEOUT_MS = 90_000;

class ProviderError extends Error {
  constructor(
    message: string,
    public readonly fallbackEligible: boolean,
  ) {
    super(message);
  }
}

export function aiIsConfigured() {
  return Boolean(env.GEMINI_API_KEY || env.OPENROUTER_API_KEY);
}

export async function completeTextPrompt(
  prompt: string,
  options: CompletionOptions,
  preference: AiProviderPreference = "auto",
  meta?: { openRouterTitle?: string; logLabel?: string },
): Promise<TextCompletion> {
  const logLabel = meta?.logLabel ?? "AI";
  const openRouterTitle = meta?.openRouterTitle ?? "Portfolio AI";

  if (preference === "gemini") {
    if (!env.GEMINI_API_KEY) {
      throw new Error("Gemini is not configured. Set GEMINI_API_KEY.");
    }
    return completeGemini(prompt, options, logLabel);
  }

  if (preference === "openrouter") {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter is not configured. Set OPENROUTER_API_KEY.");
    }
    return completeOpenRouter(prompt, options, openRouterTitle, logLabel);
  }

  if (env.GEMINI_API_KEY) {
    try {
      return await completeGemini(prompt, options, logLabel);
    } catch (error) {
      if (!(error instanceof ProviderError) || !error.fallbackEligible) throw error;
      if (!env.OPENROUTER_API_KEY) throw error;
      console.warn(`${logLabel}: Gemini unavailable; using OpenRouter.`);
    }
  }

  if (env.OPENROUTER_API_KEY) {
    return completeOpenRouter(prompt, options, openRouterTitle, logLabel);
  }

  throw new Error("No AI provider is configured.");
}

async function completeGemini(
  prompt: string,
  options: CompletionOptions,
  logLabel: string,
): Promise<TextCompletion> {
  if (!env.GEMINI_API_KEY) throw new ProviderError("Gemini not configured.", true);

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options.maxOutputTokens,
            temperature: options.temperature,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(options.timeoutMs),
      },
    );
  } catch (error) {
    console.error(`${logLabel}: Gemini request failed`, error);
    throw new ProviderError("Gemini request failed.", true);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as GeminiResponse | null;
    const msg = payload?.error?.message ?? "No detail";
    console.error(`${logLabel}: Gemini failed (${response.status}): ${msg}`);
    throw new ProviderError(
      `Gemini failed with status ${response.status}.`,
      isFallbackStatus(response.status),
    );
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new ProviderError("Gemini returned no content.", true);

  return { text, provider: "gemini", model: env.GEMINI_MODEL };
}

async function completeOpenRouter(
  prompt: string,
  options: CompletionOptions,
  openRouterTitle: string,
  logLabel: string,
): Promise<TextCompletion> {
  if (!env.OPENROUTER_API_KEY) throw new Error("OpenRouter not configured.");

  const timeoutMs = Math.max(
    options.timeoutMs * OPENROUTER_TIMEOUT_MULTIPLIER,
    OPENROUTER_MIN_TIMEOUT_MS,
  );

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": env.NEXT_PUBLIC_SITE_URL,
            "X-OpenRouter-Title": openRouterTitle,
          },
          body: JSON.stringify({
            model: env.OPENROUTER_MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: options.maxOutputTokens,
            temperature: options.temperature,
            reasoning: { exclude: true },
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(timeoutMs),
        },
      );

      if (!response.ok) {
        const payload = (await response
          .json()
          .catch(() => null)) as OpenRouterResponse | null;
        const detail = payload?.error?.message ?? "No detail";
        console.error(`${logLabel}: OpenRouter failed (${response.status}): ${detail}`);

        if (attempt === 0 && isFallbackStatus(response.status)) {
          await wait(1_500);
          continue;
        }

        throw new Error(`OpenRouter failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as OpenRouterResponse;
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("OpenRouter returned empty content.");

      return {
        text,
        provider: "openrouter",
        model: payload.model ?? env.OPENROUTER_MODEL,
      };
    } catch (error) {
      lastError = error;
      if (attempt === 0 && isTimeoutOrNetworkError(error)) {
        await wait(1_500);
        continue;
      }
      break;
    }
  }

  console.error(`${logLabel}: OpenRouter failed`, lastError);
  if (isTimeoutOrNetworkError(lastError)) {
    throw new Error(
      `OpenRouter timed out after ${Math.round(timeoutMs / 1000)}s. Free models can be slow — retry, or use Gemini.`,
    );
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error("OpenRouter request failed.");
}

function isTimeoutOrNetworkError(error: unknown) {
  if (!(error instanceof Error)) return false;
  if (error.name === "TimeoutError" || error.name === "AbortError") return true;
  return /aborted due to timeout|network|fetch failed|ECONNRESET|ETIMEDOUT/i.test(
    error.message,
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isFallbackStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}
