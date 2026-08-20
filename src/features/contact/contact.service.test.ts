import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/config/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test",
  },
}));

vi.mock("@/features/contact/contact.repository", () => ({
  contactRepository: {
    countSince: vi.fn(),
    create: vi.fn(),
  },
}));

import { contactRepository } from "@/features/contact/contact.repository";
import {
  ContactRateLimitError,
  createContactMessage,
} from "@/features/contact/contact.service";

describe("createContactMessage", () => {
  beforeEach(() => {
    vi.mocked(contactRepository.countSince).mockReset();
    vi.mocked(contactRepository.create).mockReset();
  });

  it("creates when under the hourly limit", async () => {
    vi.mocked(contactRepository.countSince).mockResolvedValue(1);
    vi.mocked(contactRepository.create).mockResolvedValue({ id: "m1" } as never);

    await createContactMessage({
      name: "Ada",
      email: "ada@example.com",
      subject: "Hello",
      message: "Hi there",
    });

    expect(contactRepository.create).toHaveBeenCalled();
  });

  it("throws ContactRateLimitError at the limit", async () => {
    vi.mocked(contactRepository.countSince).mockResolvedValue(3);

    await expect(
      createContactMessage({
        name: "Ada",
        email: "ada@example.com",
        subject: "Hello",
        message: "Hi there",
      }),
    ).rejects.toBeInstanceOf(ContactRateLimitError);
    expect(contactRepository.create).not.toHaveBeenCalled();
  });
});
