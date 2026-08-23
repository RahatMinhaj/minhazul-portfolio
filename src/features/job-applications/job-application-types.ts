export const ARTIFACT_KINDS = [
  "subject",
  "summary",
  "coverLetter",
  "emailMessage",
  "linkedinMessage",
  "keyMatches",
  "gaps",
  "interviewPoints",
] as const;

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export const TEXT_ARTIFACT_KINDS = [
  "subject",
  "summary",
  "coverLetter",
  "emailMessage",
  "linkedinMessage",
] as const;

export const LIST_ARTIFACT_KINDS = [
  "keyMatches",
  "gaps",
  "interviewPoints",
] as const;

export const ARTIFACT_SORT_ORDER: Record<ArtifactKind, number> = {
  subject: 0,
  summary: 1,
  coverLetter: 2,
  emailMessage: 3,
  linkedinMessage: 4,
  keyMatches: 5,
  gaps: 6,
  interviewPoints: 7,
};

export const ARTIFACT_KIND_LABELS: Record<ArtifactKind, string> = {
  subject: "Email Subject",
  summary: "Professional Summary",
  coverLetter: "Cover Letter",
  emailMessage: "Email Body",
  linkedinMessage: "LinkedIn Message",
  keyMatches: "Key Matches",
  gaps: "Gaps / Cautions",
  interviewPoints: "Interview Points",
};

export type GeneratedArtifacts = {
  subject: string;
  summary: string;
  coverLetter: string;
  emailMessage: string;
  linkedinMessage: string;
  keyMatches: string[];
  gaps: string[];
  interviewPoints: string[];
};

/** Explicit provider, or `auto` for Gemini-first with OpenRouter fallback. */
export type AiProviderPreference = "auto" | "gemini" | "openrouter";

export const AI_PROVIDER_PREFERENCES = [
  "auto",
  "gemini",
  "openrouter",
] as const satisfies readonly AiProviderPreference[];

export function parseAiProviderPreference(
  value: unknown,
): AiProviderPreference | null {
  const parsed = String(value ?? "").trim();
  if (
    parsed === "auto" ||
    parsed === "gemini" ||
    parsed === "openrouter"
  ) {
    return parsed;
  }
  return null;
}
