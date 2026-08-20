import { describe, expect, it } from "vitest";

import { sanitizeEmailHtml } from "./sanitize-html";

describe("sanitizeEmailHtml", () => {
  it("strips scripts and unsafe urls", () => {
    const html = sanitizeEmailHtml(
      '<p>Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><a href="https://ok.com">ok</a>',
    );
    expect(html).toContain("<p>Hi</p>");
    expect(html).not.toContain("script");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="https://ok.com"');
  });
});
