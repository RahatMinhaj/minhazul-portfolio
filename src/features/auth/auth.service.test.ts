import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/config/env", () => ({
  env: {
    ADMIN_USERNAME: "admin",
    ADMIN_EMAIL: "admin@example.com",
    AUTH_SECRET: "test-auth-secret-with-at-least-32-chars",
  },
}));

vi.mock("@/features/auth/auth.repository", () => ({
  authRepository: {
    findAdministratorByEmail: vi.fn(),
  },
}));

vi.mock("@/lib/auth/rate-limit", () => ({
  isLoginBlocked: vi.fn(),
  recordLoginFailure: vi.fn(),
  clearLoginFailures: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

import { compare } from "bcryptjs";
import { authRepository } from "@/features/auth/auth.repository";
import { authenticateAdministrator } from "@/features/auth/auth.service";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";

describe("authenticateAdministrator", () => {
  beforeEach(() => {
    vi.mocked(isLoginBlocked).mockReset();
    vi.mocked(recordLoginFailure).mockReset();
    vi.mocked(clearLoginFailures).mockReset();
    vi.mocked(authRepository.findAdministratorByEmail).mockReset();
    vi.mocked(compare).mockReset();
  });

  it("returns blocked when rate-limited", async () => {
    vi.mocked(isLoginBlocked).mockResolvedValue(true as never);
    await expect(authenticateAdministrator("admin", "x")).resolves.toEqual({
      status: "blocked",
    });
  });

  it("returns invalid and records failure for bad credentials", async () => {
    vi.mocked(isLoginBlocked).mockResolvedValue(false as never);
    vi.mocked(authRepository.findAdministratorByEmail).mockResolvedValue(null);
    vi.mocked(compare).mockResolvedValue(false as never);

    await expect(authenticateAdministrator("admin", "wrong")).resolves.toEqual({
      status: "invalid",
    });
    expect(recordLoginFailure).toHaveBeenCalledWith("admin");
  });

  it("returns authenticated and clears failures on success", async () => {
    vi.mocked(isLoginBlocked).mockResolvedValue(false as never);
    vi.mocked(authRepository.findAdministratorByEmail).mockResolvedValue({
      id: "user-1",
      active: true,
      role: "ADMIN",
      passwordHash: "hash",
    } as never);
    vi.mocked(compare).mockResolvedValue(true as never);

    await expect(
      authenticateAdministrator("admin", "secret"),
    ).resolves.toEqual({ status: "authenticated", userId: "user-1" });
    expect(clearLoginFailures).toHaveBeenCalledWith("admin");
  });
});
