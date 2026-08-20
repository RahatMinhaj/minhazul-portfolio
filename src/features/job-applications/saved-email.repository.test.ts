import { describe, expect, it } from "vitest";

import {
  isValidRecipientEmail,
  normalizeRecipientEmail,
} from "./saved-email";

describe("saved email helpers", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeRecipientEmail("  HR@Acme.COM ")).toBe("hr@acme.com");
  });

  it("validates basic email shape", () => {
    expect(isValidRecipientEmail("hr@acme.com")).toBe(true);
    expect(isValidRecipientEmail("not-an-email")).toBe(false);
  });
});
