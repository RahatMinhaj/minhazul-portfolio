import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/settings/settings.repository", () => ({
  settingsRepository: {
    findTheme: vi.fn(),
    setDefaultTheme: vi.fn(),
    setThemeActive: vi.fn(),
    deleteMessage: vi.fn(),
    updateMessage: vi.fn(),
  },
}));

import { settingsRepository } from "@/features/settings/settings.repository";
import {
  updateContactMessage,
  updateTheme,
} from "@/features/settings/settings.service";

describe("updateTheme", () => {
  beforeEach(() => {
    vi.mocked(settingsRepository.findTheme).mockReset();
    vi.mocked(settingsRepository.setDefaultTheme).mockReset();
    vi.mocked(settingsRepository.setThemeActive).mockReset();
  });

  it("rejects disabling the default theme", async () => {
    vi.mocked(settingsRepository.findTheme).mockResolvedValue({
      id: "t1",
      isDefault: true,
      active: true,
    } as never);

    await expect(updateTheme("t1", "toggle")).resolves.toEqual({
      ok: false,
      message: "Set another default theme before disabling this one.",
    });
  });

  it("sets default theme", async () => {
    vi.mocked(settingsRepository.findTheme).mockResolvedValue({
      id: "t1",
      isDefault: false,
      active: true,
    } as never);

    await expect(updateTheme("t1", "default")).resolves.toEqual({
      ok: true,
      message: "Default theme updated.",
    });
    expect(settingsRepository.setDefaultTheme).toHaveBeenCalledWith("t1");
  });
});

describe("updateContactMessage", () => {
  beforeEach(() => {
    vi.mocked(settingsRepository.deleteMessage).mockReset();
    vi.mocked(settingsRepository.updateMessage).mockReset();
  });

  it("deletes on DELETE intent", async () => {
    await expect(updateContactMessage("m1", "DELETE")).resolves.toBe(
      "Message deleted.",
    );
    expect(settingsRepository.deleteMessage).toHaveBeenCalledWith("m1");
  });

  it("marks read with readAt", async () => {
    await updateContactMessage("m1", "READ");
    expect(settingsRepository.updateMessage).toHaveBeenCalledWith(
      "m1",
      expect.objectContaining({ status: "READ", readAt: expect.any(Date) }),
    );
  });
});
