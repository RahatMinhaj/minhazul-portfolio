import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Container,
  Database,
  Network,
  PanelsTopLeft,
  Server,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/primitives";

type StackCategory = {
  id: string;
  name: string;
  slug: string;
  skills: Array<{
    id: string;
    name: string;
    highlighted: boolean;
  }>;
};

const stackIcons = {
  backend: Server,
  "microservices-architecture": Network,
  frontend: PanelsTopLeft,
  database: Database,
  ai: BrainCircuit,
  "cloud-devops": Container,
  "tools-delivery": Wrench,
} as const;

export function EngineeringSignature({
  categories,
  fullName,
  professionalTitle,
  projectCount,
  yearsOfExperience,
}: {
  categories: StackCategory[];
  fullName: string;
  professionalTitle: string;
  projectCount: number;
  yearsOfExperience: number | string;
}) {
  return (
    <section
      className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] py-10 sm:py-12"
      id="engineering-signature"
    >
      <ScrollReveal className="mb-5 flex items-center justify-between gap-4">
        <p className="eyebrow">01 / Engineering signature</p>
        <Link
          className="group inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]"
          href="/skills"
        >
          Full skill map
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            aria-hidden
            size={14}
          />
        </Link>
      </ScrollReveal>

      <ScrollReveal className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6">
        <div
          className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--border)_50%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--border)_50%,transparent)_1px,transparent_1px)] [mask-image:linear-gradient(to_right,black,transparent_92%)] bg-[size:28px_28px] opacity-25"
          aria-hidden
        />

        <div className="relative grid min-w-0 items-stretch gap-3 xl:grid-cols-[minmax(0,0.72fr)_1.5rem_minmax(0,0.72fr)_1.5rem_minmax(0,1.8fr)]">
          <FlowIdentity
            fullName={fullName}
            projectCount={projectCount}
            yearsOfExperience={yearsOfExperience}
          />

          <FlowConnector />

          <div className="group/hub relative grid min-h-36 min-w-0 place-items-center overflow-hidden rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--accent)_42%,var(--border-strong))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent)_10%,var(--surface)),var(--surface))] p-4 text-center shadow-[var(--shadow-control)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)]">
            <span
              className="absolute -top-12 -right-12 size-28 rounded-full bg-[var(--accent)] opacity-0 blur-2xl transition-opacity duration-300 group-hover/hub:opacity-20"
              aria-hidden
            />
            <div className="relative max-w-full min-w-0">
              <p className="font-mono text-[8px] tracking-[0.14em] text-[var(--accent)] uppercase">
                Engineering hub
              </p>
              <h2 className="mx-auto mt-2 max-w-full text-lg leading-6 font-semibold tracking-tight [overflow-wrap:anywhere]">
                {professionalTitle}
              </h2>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)] transition-shadow group-hover/hub:shadow-[0_0_12px_var(--accent)]" />
                <span className="max-w-full font-mono text-[8px] leading-3 tracking-[0.1em] [overflow-wrap:anywhere] text-[var(--muted)] uppercase">
                  Multi-domain delivery
                </span>
              </div>
            </div>
          </div>

          <FlowConnector />

          <StaggerContainer className="grid min-w-0 gap-2 md:grid-cols-2">
            {categories.map((category) => {
              const Icon =
                stackIcons[category.slug as keyof typeof stackIcons] ?? Wrench;
              const visibleSkills = category.skills.toSorted(
                (left, right) =>
                  Number(right.highlighted) - Number(left.highlighted),
              );
              const additionalSkillCount = Math.max(
                0,
                visibleSkills.length - 4,
              );

              return (
                <StaggerItem className="h-full min-w-0" key={category.id}>
                  <article
                    className="group grid h-full min-h-28 min-w-0 place-items-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-3 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)] focus:border-[var(--accent)] focus:bg-[var(--surface-raised)] focus:outline-none"
                    tabIndex={additionalSkillCount ? 0 : undefined}
                  >
                    <div className="flex max-w-full min-w-0 flex-col items-center">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)]">
                        <Icon aria-hidden size={14} />
                      </span>
                      <h3 className="mt-2 max-w-full text-sm leading-5 font-semibold tracking-[-0.015em] [overflow-wrap:anywhere]">
                        {category.name}
                      </h3>
                      <TechnologyLabels skills={visibleSkills} />
                      {additionalSkillCount ? (
                        <span className="mt-2 font-mono text-[7px] tracking-[0.1em] text-[var(--accent)] uppercase transition-opacity group-hover:opacity-0 group-focus:opacity-0">
                          +{additionalSkillCount} more · hover
                        </span>
                      ) : null}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </ScrollReveal>
    </section>
  );
}

function TechnologyLabels({ skills }: { skills: StackCategory["skills"] }) {
  return (
    <div className="mt-2 flex max-w-full flex-wrap items-center justify-center gap-y-1">
      {skills.map((skill, index) => (
        <span
          className={
            index < 4
              ? "contents"
              : "hidden group-hover:contents group-focus:contents"
          }
          key={skill.id}
        >
          {index > 0 ? (
            <span
              className="mx-1.5 size-1 shrink-0 rounded-full bg-[var(--accent)] opacity-65"
              aria-hidden
            />
          ) : null}
          <span className="inline-block max-w-full text-center text-[11px] leading-4 font-medium tracking-[-0.01em] [overflow-wrap:anywhere] text-[var(--foreground)]">
            {skill.name}
          </span>
        </span>
      ))}
    </div>
  );
}

function FlowIdentity({
  fullName,
  projectCount,
  yearsOfExperience,
}: {
  fullName: string;
  projectCount: number;
  yearsOfExperience: number | string;
}) {
  return (
    <div className="group/source relative grid min-h-36 min-w-0 place-items-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[linear-gradient(145deg,var(--surface-raised),var(--surface))] p-4 text-center shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)]">
      <span
        className="absolute -bottom-14 -left-12 size-32 rounded-full bg-[var(--accent)] opacity-0 blur-3xl transition-opacity duration-300 group-hover/source:opacity-20"
        aria-hidden
      />
      <div className="relative flex max-w-full min-w-0 flex-col items-center">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-control)] transition-[transform,box-shadow] duration-300 group-hover/source:-translate-y-1 group-hover/source:scale-105 group-hover/source:shadow-[var(--shadow-glow)]">
          <UserRound aria-hidden size={17} />
        </span>
        <span className="mt-2 font-mono text-[8px] tracking-[0.14em] text-[var(--muted)] uppercase">
          Source
        </span>
        <p className="mt-3 max-w-full text-sm leading-5 font-semibold [overflow-wrap:anywhere]">
          {fullName}
        </p>
        <p className="mt-1 max-w-full font-mono text-[8px] leading-4 [overflow-wrap:anywhere] text-[var(--muted)] uppercase">
          {yearsOfExperience}+ years · {projectCount} projects
        </p>
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="grid min-h-7 place-items-center" aria-hidden>
      <ArrowDown className="text-[var(--accent)] xl:hidden" size={14} />
      <div className="hidden items-center xl:flex">
        <span className="h-px w-3 bg-[var(--border-strong)]" />
        <span className="size-1.5 rotate-45 border-t border-r border-[var(--accent)]" />
      </div>
    </div>
  );
}
