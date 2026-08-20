import {
  LIST_ARTIFACT_KINDS,
  type ArtifactKind,
  type GeneratedArtifacts,
} from "./job-application-types";

const LIST_KIND_SET = new Set<string>(LIST_ARTIFACT_KINDS);

export function stripCodeFences(text: string) {
  return text.replace(/^```(?:json|html)?\s*|\s*```$/gi, "").trim();
}

export function extractJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = stripCodeFences(text);
  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    candidates.push(cleaned.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

export function parseArtifacts(text: string): GeneratedArtifacts {
  const parsed = extractJsonObject(text);
  if (!parsed) {
    return {
      subject: "",
      summary: text.slice(0, 200),
      coverLetter: text,
      emailMessage: "",
      linkedinMessage: "",
      keyMatches: [],
      gaps: [],
      interviewPoints: [],
    };
  }

  return {
    subject: String(parsed.subject ?? ""),
    summary: String(parsed.summary ?? ""),
    coverLetter: String(parsed.coverLetter ?? ""),
    emailMessage: String(parsed.emailMessage ?? ""),
    linkedinMessage: String(parsed.linkedinMessage ?? ""),
    keyMatches: asStringArray(parsed.keyMatches),
    gaps: asStringArray(parsed.gaps),
    interviewPoints: asStringArray(parsed.interviewPoints),
  };
}

export function parseSingleArtifact(text: string, kind: ArtifactKind): string {
  const parsed = extractJsonObject(text);
  if (!parsed) {
    return LIST_KIND_SET.has(kind) ? "" : stripCodeFences(text);
  }

  const value = parsed[kind];
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join("\n");
  if (typeof value === "string") return value;
  return "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}
