import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";

import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/primitives";
import { CompactSectionHeader } from "@/components/home/compact-section-header";
import { Badge } from "@/components/ui/badge";

type JourneyProject = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  projectType: string | null;
  clientName: string | null;
  technologies: string[];
};

export function ProjectJourney({ projects }: { projects: JourneyProject[] }) {
  if (!projects.length) return null;

  const visibleProjects = projects.slice(0, 4);

  return (
    <section
      className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_34%,transparent)] py-12 sm:py-16"
      id="project-journey"
    >
      <CompactSectionHeader
        eyebrow="03 / Project flow"
        href="/projects"
        linkLabel="Explore all projects"
      />
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative mx-auto grid w-fit place-items-center">
          <div
            className="absolute size-28 rounded-full border border-[var(--border-strong)] opacity-45"
            aria-hidden
          />
          <div
            className="absolute size-20 rotate-45 rounded-[1.4rem] border border-[var(--accent)] opacity-20"
            aria-hidden
          />
          <span className="relative grid size-14 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-glow)]">
            <FolderKanban aria-hidden size={23} />
          </span>
        </div>
        <p className="mt-7 font-mono text-xs tracking-[0.14em] text-[var(--accent)] uppercase">
          Healthcare · Government · Defence · Procurement
        </p>
        <ArrowDown
          className="mx-auto mt-5 text-[var(--accent)]"
          aria-hidden
          size={18}
        />
      </div>

      <div className="relative mt-8">
        <div
          className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-[var(--accent)] via-[var(--border-strong)] to-[var(--accent)] md:block"
          aria-hidden
        />
        <StaggerContainer className="relative grid gap-3 md:grid-cols-2 md:gap-x-16 md:gap-y-5">
          {visibleProjects.map((project, index) => {
            const alignRight = index % 2 === 1;

            return (
              <StaggerItem
                className={alignRight ? "md:col-start-2" : "md:col-start-1"}
                key={project.id}
              >
                <article
                  className={
                    alignRight
                      ? "group relative border-l border-[var(--border-strong)] bg-[var(--surface)] p-5 transition-colors hover:border-l-[var(--accent)] hover:bg-[var(--surface-raised)] sm:p-6 md:text-left"
                      : "group relative border-l border-[var(--border-strong)] bg-[var(--surface)] p-5 transition-colors hover:border-l-[var(--accent)] hover:bg-[var(--surface-raised)] sm:p-6 md:border-r md:border-l-0 md:text-right md:hover:border-r-[var(--accent)]"
                  }
                >
                  <span
                    className={
                      alignRight
                        ? "absolute top-7 -left-[2.35rem] hidden size-3 rounded-full border-2 border-[var(--background)] bg-[var(--accent)] shadow-[0_0_16px_var(--accent)] md:block"
                        : "absolute top-7 -right-[2.35rem] hidden size-3 rounded-full border-2 border-[var(--background)] bg-[var(--accent)] shadow-[0_0_16px_var(--accent)] md:block"
                    }
                    aria-hidden
                  />
                  <div
                    className={
                      alignRight
                        ? "flex items-start gap-3"
                        : "flex items-start gap-3 md:flex-row-reverse"
                    }
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)]">
                      <CheckCircle2 aria-hidden size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] tracking-[0.15em] text-[var(--accent)] uppercase">
                        {String(index + 1).padStart(2, "0")} / Project
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={
                      alignRight
                        ? "mt-4 flex flex-wrap gap-2"
                        : "mt-4 flex flex-wrap gap-2 md:justify-end"
                    }
                  >
                    {project.projectType ? (
                      <Badge>{project.projectType}</Badge>
                    ) : null}
                    {project.clientName ? (
                      <Badge variant="neutral">
                        <Building2 className="mr-1" aria-hidden size={10} />
                        {project.clientName}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {project.shortDescription}
                  </p>
                  <p className="mt-4 font-mono text-[9px] tracking-[0.1em] text-[var(--muted)] uppercase">
                    {project.technologies.slice(0, 5).join(" · ")}
                  </p>
                  <Link
                    className={
                      alignRight
                        ? "group/link mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]"
                        : "group/link mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)] md:flex-row-reverse"
                    }
                    href={`/projects/${project.slug}`}
                  >
                    Inspect case study
                    <ArrowRight
                      className={
                        alignRight
                          ? "transition-transform group-hover/link:translate-x-1"
                          : "transition-transform group-hover/link:translate-x-1 md:rotate-180 md:group-hover/link:-translate-x-1"
                      }
                      aria-hidden
                      size={14}
                    />
                  </Link>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
