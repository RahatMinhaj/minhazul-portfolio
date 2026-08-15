import { describe, expect, it } from "vitest";

import {
  getProjectValidationMessage,
  parseProjectFormData,
} from "@/lib/validation/admin-project";

function validProject(overrides: Record<string, string> = {}) {
  const values = {
    id: "",
    title: "Portfolio platform",
    slug: "portfolio-platform",
    shortDescription:
      "A production portfolio platform built for automated tests.",
    projectType: "Web application",
    clientName: "Border Guard Bangladesh - Defence Sector",
    companyName: "Example Engineering",
    role: "Lead developer",
    status: "COMPLETED",
    sortOrder: "4",
    startDate: "2026-01-01",
    endDate: "2026-08-01",
    githubUrl: "https://github.com/example/portfolio",
    liveUrl: "https://example.com",
    technologies: "Next.js\nTypeScript, PostgreSQL\nNext.js",
    featured: "on",
    visible: "on",
    ...overrides,
  };
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("project form validation", () => {
  it("accepts and normalizes every project input", () => {
    const result = parseProjectFormData(validProject());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      id: "",
      title: "Portfolio platform",
      slug: "portfolio-platform",
      projectType: "Web application",
      clientName: "Border Guard Bangladesh - Defence Sector",
      companyName: "Example Engineering",
      role: "Lead developer",
      status: "COMPLETED",
      sortOrder: 4,
      technologies: ["Next.js", "TypeScript", "PostgreSQL"],
      featured: true,
      visible: true,
    });
    expect(result.data.startDate?.toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it.each([
    ["title", "x", "title", "Title must contain at least 2 characters."],
    ["slug", "Invalid Slug", "slug", "Use lowercase letters"],
    [
      "shortDescription",
      "Too short",
      "short description",
      "at least 20 characters",
    ],
    ["status", "UNKNOWN", "status", "Invalid option"],
    ["sortOrder", "-1", "sort order", "expected number to be >=0"],
    [
      "githubUrl",
      "ftp://example.com",
      "github url",
      "must use http:// or https://",
    ],
    ["startDate", "not-a-date", "start date", "valid date"],
  ])("rejects an invalid %s input", (field, value, label, message) => {
    const result = parseProjectFormData(validProject({ [field]: value }));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(getProjectValidationMessage(result.error)).toContain(label);
    expect(getProjectValidationMessage(result.error)).toContain(message);
  });

  it("rejects an end date before the start date", () => {
    const result = parseProjectFormData(
      validProject({ startDate: "2026-08-01", endDate: "2026-01-01" }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(getProjectValidationMessage(result.error)).toContain(
      "End date cannot be earlier than the start date.",
    );
  });

  it("allows optional project inputs to be empty", () => {
    const result = parseProjectFormData(
      validProject({
        projectType: "",
        clientName: "",
        companyName: "",
        role: "",
        startDate: "",
        endDate: "",
        githubUrl: "",
        liveUrl: "",
        technologies: "",
        featured: "",
        visible: "",
      }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      projectType: null,
      clientName: null,
      companyName: null,
      role: null,
      startDate: null,
      endDate: null,
      githubUrl: null,
      liveUrl: null,
      technologies: [],
      featured: false,
      visible: false,
    });
  });
});
