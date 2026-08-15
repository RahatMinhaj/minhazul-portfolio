import { describe, expect, it } from "vitest";

import { loginSchema } from "@/lib/validation/auth";
import { contactSchema } from "@/lib/validation/contact";

describe("public form validation", () => {
  it("normalizes valid contact input", () => {
    const result = contactSchema.parse({
      name: "  Minhaj  ",
      email: "MINHAJ@EXAMPLE.COM",
      subject: "  Project enquiry  ",
      message: "  I would like to discuss a complete portfolio project.  ",
      company: "",
    });

    expect(result).toMatchObject({
      name: "Minhaj",
      email: "minhaj@example.com",
      subject: "Project enquiry",
    });
  });

  it("rejects invalid contact fields and bot honeypot input", () => {
    const result = contactSchema.safeParse({
      name: "M",
      email: "invalid",
      subject: "x",
      message: "short",
      company: "bot company",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors).toMatchObject({
      name: expect.any(Array),
      email: expect.any(Array),
      subject: expect.any(Array),
      message: expect.any(Array),
      company: expect.any(Array),
    });
  });

  it("accepts valid admin credentials and rejects incomplete credentials", () => {
    expect(
      loginSchema.safeParse({ username: "admin", password: "secret" }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ username: "ad", password: "" }).success,
    ).toBe(false);
  });
});
