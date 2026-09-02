import "server-only";

import { env } from "@/config/env";

import type { CompletionOptions, TextCompletion } from "./text-completion";

type GeminiFileRecord = {
  name?: string;
  uri?: string;
  mimeType?: string;
  state?: string;
  error?: { message?: string };
};

type GeminiUploadResponse = {
  file?: GeminiFileRecord;
  error?: { message?: string };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

const FILE_POLL_INTERVAL_MS = 1_500;
const FILE_POLL_MAX_MS = 90_000;

/**
 * Send instructions + rich HTML via Gemini Files API (text/html).
 * Preserves headings, lists, emphasis, and other structure — not plain text.
 */
export async function completeGeminiHtmlFilePrompt(
  instruction: string,
  htmlContent: string,
  options: CompletionOptions,
  logLabel = "Gemini HTML file",
): Promise<TextCompletion> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Gemini is not configured. Set GEMINI_API_KEY for large paste imports.");
  }

  const displayName = `interview-prep-paste-${Date.now()}.html`;
  let fileName: string | null = null;

  try {
    const uploaded = await uploadGeminiHtmlFile(htmlContent, displayName, logLabel);
    fileName = uploaded.name ?? null;
    if (!uploaded.uri || !uploaded.mimeType) {
      throw new Error("Gemini file upload did not return a usable URI.");
    }

    await waitForGeminiFileActive(uploaded.name!, logLabel);

    const text = await generateWithGeminiFile(
      instruction,
      uploaded.uri,
      uploaded.mimeType,
      options,
      logLabel,
    );

    return { text, provider: "gemini", model: env.GEMINI_MODEL };
  } finally {
    if (fileName) {
      await deleteGeminiFile(fileName, logLabel).catch(() => undefined);
    }
  }
}

async function uploadGeminiHtmlFile(
  html: string,
  displayName: string,
  logLabel: string,
): Promise<GeminiFileRecord> {
  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify({ file: { displayName } })], {
      type: "application/json",
    }),
  );
  formData.append(
    "file",
    new Blob([html], { type: "text/html; charset=utf-8" }),
    displayName,
  );

  const response = await fetch(
    "https://generativelanguage.googleapis.com/upload/v1beta/files",
    {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": env.GEMINI_API_KEY!,
        "X-Goog-Upload-Protocol": "multipart",
      },
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as GeminiUploadResponse | null;
    const detail = payload?.error?.message ?? "No detail";
    console.error(`${logLabel}: Gemini HTML upload failed (${response.status}): ${detail}`);
    throw new Error(`Gemini file upload failed (${response.status}).`);
  }

  const payload = (await response.json()) as GeminiUploadResponse;
  if (!payload.file?.name || !payload.file.uri) {
    throw new Error("Gemini file upload returned an invalid file record.");
  }

  return payload.file;
}

async function waitForGeminiFileActive(name: string, logLabel: string) {
  const started = Date.now();

  while (Date.now() - started < FILE_POLL_MAX_MS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${name}`,
      {
        headers: { "X-Goog-Api-Key": env.GEMINI_API_KEY! },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as GeminiUploadResponse | null;
      throw new Error(
        payload?.error?.message ?? `Gemini file status check failed (${response.status}).`,
      );
    }

    const file = (await response.json()) as GeminiFileRecord;
    if (file.state === "ACTIVE") return;
    if (file.state === "FAILED") {
      throw new Error(file.error?.message ?? "Gemini file processing failed.");
    }

    await sleep(FILE_POLL_INTERVAL_MS);
  }

  throw new Error("Gemini file was not ready in time.");
}

async function generateWithGeminiFile(
  instruction: string,
  fileUri: string,
  mimeType: string,
  options: CompletionOptions,
  logLabel: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: instruction },
              { file_data: { mime_type: mimeType, file_uri: fileUri } },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens,
          temperature: options.temperature,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(Math.max(options.timeoutMs, 120_000)),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as GeminiResponse | null;
    const detail = payload?.error?.message ?? "No detail";
    console.error(`${logLabel}: Gemini HTML generate failed (${response.status}): ${detail}`);
    throw new Error(`Gemini failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned no content for the uploaded HTML.");
  return text;
}

async function deleteGeminiFile(name: string, logLabel: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${name}`,
    {
      method: "DELETE",
      headers: { "X-Goog-Api-Key": env.GEMINI_API_KEY! },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    console.warn(`${logLabel}: Gemini file delete failed (${response.status}) for ${name}`);
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
