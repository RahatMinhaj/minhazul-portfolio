import "server-only";

import { createHmac } from "node:crypto";

import { authRepository } from "@/features/auth/auth.repository";
import { LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS } from "@/lib/auth/constants";

function getRateLimitKey(identifier: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  return createHmac("sha256", secret)
    .update(identifier.trim().toLowerCase())
    .digest("hex");
}

export async function isLoginBlocked(identifier: string) {
  const attempt = await authRepository.findAttempt(getRateLimitKey(identifier));

  return Boolean(attempt?.blockedUntil && attempt.blockedUntil > new Date());
}

export async function recordLoginFailure(identifier: string) {
  const keyHash = getRateLimitKey(identifier);
  const now = new Date();
  const current = await authRepository.findAttempt(keyHash);
  const currentWindowActive = Boolean(
    current &&
    now.getTime() - current.windowStartedAt.getTime() < LOGIN_WINDOW_MS,
  );
  const failureCount = currentWindowActive ? current!.failureCount + 1 : 1;

  await authRepository.upsertAttempt(
    keyHash,
    {
      keyHash,
      failureCount,
      windowStartedAt: now,
      blockedUntil:
        failureCount >= LOGIN_MAX_FAILURES
          ? new Date(now.getTime() + LOGIN_WINDOW_MS)
          : null,
    },
    {
      failureCount,
      windowStartedAt: currentWindowActive ? current!.windowStartedAt : now,
      blockedUntil:
        failureCount >= LOGIN_MAX_FAILURES
          ? new Date(now.getTime() + LOGIN_WINDOW_MS)
          : null,
    },
  );
}

export async function clearLoginFailures(identifier: string) {
  await authRepository.clearAttempts(getRateLimitKey(identifier));
}
