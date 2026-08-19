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
