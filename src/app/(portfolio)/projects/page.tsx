import type { Metadata } from "next";

import {
  ProjectExplorer,
  type ProjectSummary,
} from "@/components/projects/project-explorer";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { getVisibleProjects } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected engineering work, architecture, and outcomes.",
};

export default async function ProjectsPage() {
  const projects = await getVisibleProjects();
  const summaries: ProjectSummary[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    projectType: project.projectType,
    status: project.status,
    technologies: project.technologies,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
  }));

  return (
    <main id="main-content">
      <PageHero
        description="Searchable case studies showing the problem, technical decisions, architecture, constraints, and verified outcomes."
        eyebrow="Work / Case studies"
        status={`${projects.length} public`}
        title="Systems built with intent."
      />
      <Container className="py-16 sm:py-24">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectExplorer projects={summaries} />
        )}
      </Container>
    </main>
  );
}
