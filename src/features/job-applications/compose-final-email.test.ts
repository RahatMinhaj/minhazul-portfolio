import { describe, expect, it } from "vitest";

import { assembleFinalEmailHtml } from "./compose-final-email";

describe("assembleFinalEmailHtml", () => {
  it("returns only the draft body when extras are unchecked", () => {
    expect(
      assembleFinalEmailHtml({
        bodyHtml: "<p>Hello</p>",
        coverLetter: "Cover letter text",
        signatureHtml: "<p>Minhazul</p>",
        includeCoverLetter: false,
        includeSignature: false,
      }),
    ).toBe("<p>Hello</p>");
  });

  it("appends cover letter and signature when included", () => {
    const html = assembleFinalEmailHtml({
      bodyHtml: "<p>Hello</p>",
      coverLetter: "I would like to apply.",
      signatureHtml: "<p>Minhazul Islam</p>",
      includeCoverLetter: true,
      includeSignature: true,
    });

    expect(html).toContain("<p>Hello</p>");
    expect(html).toContain("<hr />");
    expect(html).toContain("I would like to apply.");
    expect(html).toContain("<p>Minhazul Islam</p>");
  });

  it("omits cover letter after it is unchecked", () => {
    const html = assembleFinalEmailHtml({
      bodyHtml: "<p>Hello</p>",
      coverLetter: "Cover",
      signatureHtml: "<p>Sig</p>",
      includeCoverLetter: false,
      includeSignature: true,
    });

    expect(html).not.toContain("Cover");
    expect(html).toContain("<p>Sig</p>");
  });
});
