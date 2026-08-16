import { describe, expect, it } from "vitest";

import { optionalImageReferenceSchema } from "@/lib/validation/media";

describe("image reference validation", () => {
  it("accepts server paths, HTTP URLs, HTTPS URLs, and empty values", () => {
    expect(
      optionalImageReferenceSchema.safeParse("/api/media/image-id").success,
    ).toBe(true);
    expect(
      optionalImageReferenceSchema.safeParse("https://example.com/logo.png")
        .success,
    ).toBe(true);
    expect(
      optionalImageReferenceSchema.safeParse("http://example.com/logo.png")
        .success,
    ).toBe(true);
    expect(optionalImageReferenceSchema.safeParse("").success).toBe(true);
  });

  it("rejects unsafe protocols and protocol-relative URLs", () => {
    expect(
      optionalImageReferenceSchema.safeParse("javascript:alert(1)").success,
    ).toBe(false);
    expect(
      optionalImageReferenceSchema.safeParse("//example.com/logo.png").success,
    ).toBe(false);
  });
});
