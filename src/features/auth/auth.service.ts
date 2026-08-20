import "server-only";

import { compare } from "bcryptjs";

import { env } from "@/config/env";
import { authRepository } from "@/features/auth/auth.repository";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";

const NON_USER_PASSWORD_HASH =
  "$2b$12$EQRjyxJB71W11Ms3e5.3DOXvfj6GyErv9R6337mZAoY0C8bBRDLFm";

export type AuthenticationResult =
  | { status: "blocked" }
  | { status: "invalid" }
  | { status: "authenticated"; userId: string };

export async function authenticateAdministrator(
  username: string,
  password: string,
): Promise<AuthenticationResult> {
  if (await isLoginBlocked(username)) return { status: "blocked" };

  const configuredUsername = env.ADMIN_USERNAME;
  const configuredEmail = env.ADMIN_EMAIL?.toLowerCase();
  const user =
    username === configuredUsername && configuredEmail
      ? await authRepository.findAdministratorByEmail(configuredEmail)
      : null;
  const passwordMatches = await compare(
    password,
    user?.passwordHash ?? NON_USER_PASSWORD_HASH,
  );

  if (!user || !user.active || user.role !== "ADMIN" || !passwordMatches) {
    await recordLoginFailure(username);
    return { status: "invalid" };
  }

  await clearLoginFailures(username);
  return { status: "authenticated", userId: user.id };
}
