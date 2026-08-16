import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/primitives";
import { TechnologyMark } from "@/components/home/engineering-signature";
import { VisualIcon } from "@/components/shared/visual-icon";

type StackCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    highlighted: boolean;
  }>;
};

export function EngineeringSignature({
  categories,
  fullName,
  professionalTitle,
  labels,
}: {
  categories: StackCategory[];
  fullName: string;
  professionalTitle: string;
  projectCount: number;
  yearsOfExperience: number | string;
  labels: {
    section: string;
    link: string;
    core: string;
    inventory: string;
    scroll: string;
  };
}) {
  const coreSkills = categories.flatMap((category) =>
    category.skills.filter((skill) => skill.highlighted),
  );

  return (
    <section
      className="border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] py-8 sm:py-10"
      id="engineering-signature"
    >
      <ScrollReveal className="mb-5 flex items-center justify-between gap-4">
        <p className="eyebrow">{labels.section}</p>
        <Link
          className="group inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent)]"
          href="/skills"
        >
          {labels.link}
          <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            aria-hidden
            size={14}
          />
        </Link>
      </ScrollReveal>

      <ScrollReveal className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_4%,var(--surface))] p-4 sm:p-5 lg:border-r lg:border-b-0">
            <div>
              <h2 className="text-xl leading-7 font-semibold tracking-[-0.03em]">
                {professionalTitle}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{fullName}</p>

              {coreSkills.length ? (
                <div className="mt-5">
                  <div className="mb-2">
                    <h3 className="font-mono text-[9px] tracking-[0.13em] text-[var(--accent)] uppercase">
                      {labels.core}
                    </h3>
                  </div>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {coreSkills.map((skill) => (
                      <li
                        className="flex min-w-0 items-center gap-1.5 rounded-md border border-[var(--accent)] bg-[var(--surface)] p-1.5"
                        key={skill.id}
                      >
                        <TechnologyMark
                          iconUrl={skill.icon}
                          name={skill.name}
                          slug={skill.slug}
                        />
                        <span className="min-w-0 truncate text-[11px] font-semibold">
                          {skill.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2.5 sm:px-4">
              <h3 className="text-base font-semibold">{labels.inventory}</h3>
              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[7px] tracking-[0.08em] text-[var(--muted)] uppercase">
                {labels.scroll} ↓
              </span>
            </header>

            <div
              aria-label="Complete technology inventory. Scroll vertically to explore all skill domains."
              className="h-[22rem] [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] overflow-y-auto outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
              role="region"
              tabIndex={0}
            >
              <StaggerContainer className="divide-y divide-[var(--border)]">
                {categories.map((category) => {
                  const skills = category.skills.toSorted(
                    (left, right) =>
                      Number(right.highlighted) - Number(left.highlighted),
                  );

                  return (
                    <StaggerItem key={category.id}>
                      <article className="grid gap-3 p-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:px-4">
                        <header className="flex items-start gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] text-[var(--accent)]">
                            <VisualIcon
                              className="size-4"
                              fallback={category.slug}
                              name={category.name}
                              value={category.icon}
                            />
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm leading-5 font-semibold">
                              {category.name}
                            </h4>
                          </div>
                        </header>

                        <ul className="flex flex-wrap content-start gap-1.5">
                          {skills.map((skill) => (
                            <li
                              className={
                                skill.highlighted
                                  ? "inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_7%,var(--surface))] px-1.5 py-1"
                                  : "inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-1.5 py-1"
                              }
                              key={skill.id}
                            >
                              <TechnologyMark
                                iconUrl={skill.icon}
                                name={skill.name}
                                slug={skill.slug}
                              />
                              <span className="text-[11px] leading-4 font-medium">
                                {skill.name}
                              </span>
                              {skill.highlighted ? (
                                <span
                                  className="size-1 shrink-0 rounded-full bg-[var(--accent)]"
                                  aria-label="Core skill"
                                />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </article>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
