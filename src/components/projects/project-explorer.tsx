"use client";

import { Code2, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ProjectVisual } from "@/components/projects/project-visual";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  projectType: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
};

export function ProjectExplorer({ projects }: { projects: ProjectSummary[] }) {
  const [query, setQuery] = useState("");
  const [technology, setTechnology] = useState("all");
  const technologies = useMemo(
    () =>
      [...new Set(projects.flatMap((project) => project.technologies))].sort(),
    [projects],
  );
  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (technology === "all" || project.technologies.includes(technology)) &&
        (!normalized ||
          project.title.toLowerCase().includes(normalized) ||
          project.shortDescription.toLowerCase().includes(normalized) ||
          project.technologies.some((item) =>
            item.toLowerCase().includes(normalized),
          )),
    );
  }, [projects, query, technology]);

  return (
    <>
      <div className="mb-8 grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-[1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search projects</span>
          <Search
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden
            size={16}
          />
          <Input
            className="pl-10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects or technologies…"
            value={query}
          />
        </label>
        <label>
          <span className="sr-only">Filter by technology</span>
          <select
            className="h-11 min-w-52 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm"
            onChange={(event) => setTechnology(event.target.value)}
            value={technology}
          >
            <option value="all">All technologies</option>
            {technologies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleProjects.map((project, index) => (
          <Card
            className="group relative flex flex-col overflow-hidden transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-glow)]"
            key={project.id}
          >
            <ProjectVisual index={index} projectType={project.projectType} />
            <CardHeader>
              <div className="mb-4 flex items-center justify-between gap-3">
                <Badge variant={project.featured ? "default" : "neutral"}>
                  {project.featured ? "Featured" : project.status}
                </Badge>
                <div className="relative z-20 flex gap-1">
                  {project.githubUrl ? (
                    <a
                      aria-label={`${project.title} source code`}
                      className="grid size-10 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      href={project.githubUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Code2 aria-hidden size={17} />
                    </a>
                  ) : null}
                  {project.liveUrl ? (
                    <a
                      aria-label={`${project.title} live website`}
                      className="grid size-10 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      href={project.liveUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink aria-hidden size={17} />
                    </a>
                  ) : null}
                </div>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                <Link
                  className="after:absolute after:inset-0"
                  href={`/projects/${project.slug}`}
                >
                  {project.title}
                </Link>
              </h2>
              <CardDescription>{project.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-wrap gap-2">
              {project.technologies.map((item) => (
                <Badge key={item} variant="neutral">
                  {item}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visibleProjects.length} projects shown
      </p>
      {visibleProjects.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--muted)]">
          No projects match the current filters.
        </p>
      ) : null}
    </>
  );
}
