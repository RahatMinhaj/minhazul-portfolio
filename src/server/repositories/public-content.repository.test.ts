import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const findFirst = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({
  getDatabase: () => ({
    project: { findFirst, findMany },
  }),
  isDatabaseConfigured: () => true,
}));

import {
  getVisibleProjectBySlug,
  getVisibleProjects,
} from "@/server/repositories/public-content.repository";

describe("public project queries", () => {
  beforeEach(() => {
    findFirst.mockReset();
    findMany.mockReset();
  });

  it("returns all visible projects with featured projects first", async () => {
    findMany.mockResolvedValue([]);

    await getVisibleProjects();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { visible: true },
        orderBy: [
          { featured: "desc" },
          { sortOrder: "asc" },
          { updatedAt: "desc" },
        ],
      }),
    );
    expect(findMany.mock.calls[0]?.[0]).not.toHaveProperty("take");
  });

  it("allows a visible project detail regardless of workflow status", async () => {
    findFirst.mockResolvedValue(null);

    await getVisibleProjectBySlug("draft-project");

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "draft-project", visible: true },
      }),
    );
  });
});
