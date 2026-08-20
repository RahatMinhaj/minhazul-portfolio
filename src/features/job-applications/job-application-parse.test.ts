import { describe, expect, it } from "vitest";

import { parseSingleArtifact } from "./job-application-parse";

describe("parseSingleArtifact", () => {
  it("extracts only the requested key from a full artifacts object", () => {
    const text = JSON.stringify({
      subject: "Keep me",
      coverLetter: "Do not use",
      emailMessage: "Also ignore",
      keyMatches: ["one"],
    });

    expect(parseSingleArtifact(text, "subject")).toBe("Keep me");
    expect(parseSingleArtifact(text, "coverLetter")).toBe("Do not use");
  });

  it("ignores extra keys when only one field is present", () => {
    expect(
      parseSingleArtifact(
        '{"emailMessage":"Hello team","subject":"I applied"}',
        "emailMessage",
      ),
    ).toBe("Hello team");
  });

  it("joins list artifacts", () => {
    expect(
      parseSingleArtifact('{"gaps":["No Go","Unclear stack"]}', "gaps"),
    ).toBe("No Go\nUnclear stack");
  });

  it("reads fenced JSON", () => {
    expect(
      parseSingleArtifact(
        '```json\n{"linkedinMessage":"Hi, I am interested"}\n```',
        "linkedinMessage",
      ),
    ).toBe("Hi, I am interested");
  });
});
