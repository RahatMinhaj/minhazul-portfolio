import { describe, expect, it } from "vitest";

import {
  ensureLexicalJson,
  htmlToLexicalJson,
  lexicalJsonToHtml,
  markdownishToHtml,
  richTextToPlainText,
  TEXT_FORMAT,
} from "./rich-text";

describe("rich text HTML conversion", () => {
  it("round-trips lists, links, and bold", () => {
    const html =
      '<p>Hi <strong>there</strong></p><ul><li>One</li></ul><ol><li>Two</li></ol><p><a href="https://example.com">Site</a></p>';
    const json = htmlToLexicalJson(html);
    const back = lexicalJsonToHtml(json);

    expect(back).toContain("<strong>there</strong>");
    expect(back).toContain("<ul>");
    expect(back).toContain("<ol>");
    expect(back).toContain('href="https://example.com"');
    expect(back).toContain("Site");
  });

  it("maps strikethrough and code with the correct format bits", () => {
    const json = JSON.stringify({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "gone",
                format: TEXT_FORMAT.strikethrough,
              },
              {
                type: "text",
                text: "code",
                format: TEXT_FORMAT.code,
              },
            ],
          },
        ],
      },
    });

    const html = lexicalJsonToHtml(json);
    expect(html).toContain("<s>gone</s>");
    expect(html).toContain("<code>code</code>");
  });

  it("reads Lexical JSON strings as plain text", () => {
    const json = JSON.stringify({
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Plain from json" }],
          },
        ],
      },
    });

    expect(richTextToPlainText(json)).toBe("Plain from json");
  });
});

describe("ensureLexicalJson", () => {
  it("converts markdownish answers into lexical lists and headings", () => {
    const json = ensureLexicalJson(`## Hook
Core idea.

- Point one
- Point two`);
    const html = lexicalJsonToHtml(json);
    expect(html).toContain("<h2>");
    expect(html).toContain("<ul>");
    expect(richTextToPlainText(json)).toContain("Point one");
  });

  it("keeps existing lexical documents", () => {
    const original = htmlToLexicalJson("<p>Already structured</p>");
    expect(ensureLexicalJson(original)).toBe(original);
  });
});

describe("markdownishToHtml", () => {
  it("formats bold and code", () => {
    expect(markdownishToHtml("Use **JWT** with `exp`")).toContain("<strong>JWT</strong>");
    expect(markdownishToHtml("Use **JWT** with `exp`")).toContain("<code>exp</code>");
  });
});
