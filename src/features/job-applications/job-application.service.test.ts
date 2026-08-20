import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  upsertArtifactByKind,
  upsertArtifacts,
  createGeneration,
  getAdminJobApplicationById,
  regenerateSingleArtifact,
  buildCandidateContext,
} = vi.hoisted(() => ({
  upsertArtifactByKind: vi.fn(),
  upsertArtifacts: vi.fn(),
  createGeneration: vi.fn(),
  getAdminJobApplicationById: vi.fn(),
  regenerateSingleArtifact: vi.fn(),
  buildCandidateContext: vi.fn(),
}));

vi.mock("./candidate-context", () => ({
  buildCandidateContext,
}));
vi.mock("./job-application.generator", () => ({
  regenerateSingleArtifact,
  generateAllArtifacts: vi.fn(),
  extractMetadataFromCircular: vi.fn(),
  PROMPT_VERSION: "v2",
}));
vi.mock("@/features/cv/cv-storage", () => ({
  readCv: vi.fn(),
}));
vi.mock("@/features/email/email.provider", () => ({
  sendEmail: vi.fn(),
}));
vi.mock("./job-application.repository", () => ({
  upsertArtifactByKind,
  upsertArtifacts,
  createGeneration,
  getAdminJobApplicationById,
  updateArtifactById: vi.fn(),
  createJobApplication: vi.fn(),
  updateJobApplication: vi.fn(),
  deleteJobApplication: vi.fn(),
  createDelivery: vi.fn(),
  updateDelivery: vi.fn(),
}));

import { regenerateArtifact } from "./job-application.service";

describe("regenerateArtifact", () => {
  beforeEach(() => {
    upsertArtifactByKind.mockReset();
    upsertArtifacts.mockReset();
    createGeneration.mockReset();
    getAdminJobApplicationById.mockReset();
    regenerateSingleArtifact.mockReset();
    buildCandidateContext.mockReset();
  });

  it("writes only the requested kind", async () => {
    getAdminJobApplicationById.mockResolvedValue({
      id: "app-1",
      circularContent: "A role at Acme",
      jobDescription: "A role at Acme",
      tone: null,
      artifacts: [
        { kind: "subject", content: "Old subject" },
        { kind: "coverLetter", content: "Old letter" },
        { kind: "emailMessage", content: "Old body" },
      ],
    });
    buildCandidateContext.mockResolvedValue({});
    regenerateSingleArtifact.mockResolvedValue({
      content: "New subject only",
      provider: "gemini",
      model: "test",
    });
    upsertArtifactByKind.mockResolvedValue({ id: "art-1" });
    createGeneration.mockResolvedValue({ id: "gen-1" });

    const result = await regenerateArtifact("app-1", "subject");

    expect(result).toEqual({
      ok: true,
      message: "Regenerated subject.",
      content: "New subject only",
      kind: "subject",
    });
    expect(upsertArtifactByKind).toHaveBeenCalledWith(
      "app-1",
      expect.objectContaining({
        kind: "subject",
        content: "New subject only",
      }),
    );
    expect(upsertArtifacts).not.toHaveBeenCalled();
    expect(regenerateSingleArtifact).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "subject",
        existingArtifacts: expect.objectContaining({
          subject: "Old subject",
          coverLetter: "Old letter",
          emailMessage: "Old body",
        }),
      }),
    );
  });
});
