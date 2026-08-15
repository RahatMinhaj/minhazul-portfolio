import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectJourney } from "@/components/home/project-journey";

describe("ProjectJourney", () => {
  it("renders every visible project supplied by the public query", () => {
    const projects = Array.from({ length: 10 }, (_, index) => ({
      id: String(index),
      title: `Project ${index + 1}`,
      slug: `project-${index + 1}`,
      shortDescription: `Description for project ${index + 1}`,
      projectType: "Web application",
      clientName: null,
      technologies: ["TypeScript"],
      featured: index === 0,
    }));

    render(<ProjectJourney projects={projects} />);

    expect(screen.getAllByRole("link", { name: /Inspect case study/i })).toHaveLength(
      10,
    );
    expect(
      screen.getByRole("heading", { name: "Project 10" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });
});
