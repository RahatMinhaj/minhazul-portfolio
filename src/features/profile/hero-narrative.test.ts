import { describe, expect, it } from "vitest";

import {
  resolveHeroParagraphs,
  richTextToParagraphs,
  splitHeroTextSegments,
} from "@/features/profile/hero-narrative";

describe("hero narrative helpers", () => {
  it("extracts paragraphs from rich text documents", () => {
    expect(
      richTextToParagraphs({
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "First paragraph." }],
            },
            {
              type: "paragraph",
              children: [{ type: "text", text: "Second paragraph." }],
            },
          ],
        },
      }),
    ).toEqual(["First paragraph.", "Second paragraph."]);
  });

  it("prefers long bio paragraphs over short bio", () => {
    expect(
      resolveHeroParagraphs({
        longBio: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "Long form lead." }],
              },
            ],
          },
        },
        shortBio: "Short bio fallback.",
      }),
    ).toEqual(["Long form lead."]);
  });

  it("preserves authored paragraph boundaries from the admin bio", () => {
    expect(
      resolveHeroParagraphs({
        longBio: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "I believe that every problem is an opportunity to innovate.",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "My goal is to design and build software solutions that are not only robust and scalable but also intuitive and forward-thinking.",
                },
              ],
            },
          ],
        },
        shortBio: "unused",
      }),
    ).toEqual([
      "I believe that every problem is an opportunity to innovate.",
      "My goal is to design and build software solutions that are not only robust and scalable but also intuitive and forward-thinking.",
    ]);
  });

  it("highlights dynamic terms supplied from profile data", () => {
    expect(
      splitHeroTextSegments(
        "Experience in Java, Spring Boot, and distributed systems.",
        ["Java", "Spring Boot", "distributed systems"],
      ),
    ).toEqual([
      { text: "Experience in ", highlighted: false },
      { text: "Java", highlighted: true },
      { text: ", ", highlighted: false },
      { text: "Spring Boot", highlighted: true },
      { text: ", and ", highlighted: false },
      { text: "distributed systems", highlighted: true },
      { text: ".", highlighted: false },
    ]);
  });
});
