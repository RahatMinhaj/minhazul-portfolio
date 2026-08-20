import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findFirst = vi.fn();
const update = vi.fn();
const create = vi.fn();
const deleteMany = vi.fn();
const transaction = vi.fn();

vi.mock("@/lib/db/client", () => ({
  getDatabase: () => ({
    $transaction: transaction,
    jobApplicationArtifact: { findFirst, update, create, deleteMany },
  }),
}));

import {
  updateArtifactById,
  upsertArtifactByKind,
  upsertArtifacts,
} from "./job-application.repository";

describe("job application artifact persistence", () => {
  beforeEach(() => {
    findFirst.mockReset();
    update.mockReset();
    create.mockReset();
    deleteMany.mockReset();
    transaction.mockReset();
    transaction.mockImplementation(async (ops: unknown[]) => ops);
  });

  it("updates a single kind without deleting siblings", async () => {
    findFirst.mockResolvedValue({
      id: "art-1",
      kind: "coverLetter",
      customKind: null,
      title: null,
      format: "MARKDOWN",
      sortOrder: 2,
    });
    update.mockResolvedValue({ id: "art-1" });

    await upsertArtifactByKind("app-1", {
      kind: "coverLetter",
      content: "New letter",
      generated: true,
    });

    expect(deleteMany).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: "art-1" },
      data: expect.objectContaining({
        content: "New letter",
        generated: true,
      }),
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("creates the kind when it does not exist yet", async () => {
    findFirst.mockResolvedValue(null);
    create.mockResolvedValue({ id: "art-2" });

    await upsertArtifactByKind("app-1", {
      kind: "subject",
      content: "Hello",
      sortOrder: 0,
    });

    expect(deleteMany).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        applicationId: "app-1",
        kind: "subject",
        content: "Hello",
      }),
    });
  });

  it("still replaces the full set on generate-all", async () => {
    await upsertArtifacts("app-1", [
      { kind: "subject", content: "A" },
      { kind: "coverLetter", content: "B" },
    ]);

    expect(transaction).toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalledWith({
      where: { applicationId: "app-1" },
    });
  });

  it("updates an artifact by id without touching siblings", async () => {
    update.mockResolvedValue({ id: "art-1" });

    await updateArtifactById("art-1", {
      content: "Edited",
      kind: "summary",
    });

    expect(deleteMany).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: "art-1" },
      data: expect.objectContaining({
        content: "Edited",
        kind: "summary",
      }),
    });
  });
});
