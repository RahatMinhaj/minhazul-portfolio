import { describe, expect, it } from "vitest";

import { normalizeSkillSlug, skillIconSchema } from "@/lib/validation/skill";

describe("skill validation", () => {
  it("accepts library icons, external image URLs, and an empty icon", () => {
    expect(skillIconSchema.safeParse("simple-icons:springboot").success).toBe(
      true,
    );
    expect(
      skillIconSchema.safeParse("https://example.com/java.svg").success,
    ).toBe(true);
    expect(
      skillIconSchema.safeParse(
        "/api/media/123e4567-e89b-12d3-a456-426614174000",
      ).success,
    ).toBe(true);
    expect(skillIconSchema.safeParse("").success).toBe(true);
  });

  it("rejects malformed icon values and unsafe URL protocols", () => {
    expect(skillIconSchema.safeParse("springboot").success).toBe(false);
    expect(skillIconSchema.safeParse("javascript:alert(1)").success).toBe(
      false,
    );
  });

  it("creates stable slugs for common technology names", () => {
    expect(normalizeSkillSlug("", "C#")).toBe("c-sharp");
    expect(normalizeSkillSlug("", "C++ & .NET")).toBe("c-plus-plus-and-net");
    expect(normalizeSkillSlug("Spring Boot", "ignored")).toBe("spring-boot");
  });
});
