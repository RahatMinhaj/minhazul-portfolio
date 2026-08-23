import { ArrowRight, ArrowUpRight } from "lucide-react";
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
  projectCount,
  yearsOfExperience,
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
    coreDescription: string;
    inventory: string;
    scroll: string;
  };
}) {
  const coreSkills = categories.flatMap((category) =>
    category.skills
      .filter((skill) => skill.highlighted)
      .map((skill) => ({ ...skill, categoryName: category.name })),
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
        <div className="grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-stretch">
          <aside className="relative isolate overflow-hidden border-b border-[var(--border)] lg:border-r lg:border-b-0">
            {/* Atmospheric layers — not a flat tinted column */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_55%),linear-gradient(165deg,color-mix(in_srgb,var(--accent)_14%,var(--surface))_0%,var(--surface)_48%,color-mix(in_srgb,var(--surface-raised)_90%,var(--accent))_100%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_70%,transparent)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black_20%,transparent_85%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-8 rotate-12 font-mono text-[7.5rem] leading-none font-semibold tracking-[-0.08em] text-[color-mix(in_srgb,var(--accent)_16%,transparent)] select-none"
            >
              01
            </div>

            <div className="relative flex h-full flex-col gap-6 p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[var(--accent)]" aria-hidden />
                  <p className="font-mono text-[10px] tracking-[0.22em] text-[var(--accent)] uppercase">
                    Signature
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--muted)]">
                    {fullName}
                  </p>
                  <h2 className="mt-2 max-w-[16rem] text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.04em] sm:text-[1.85rem]">
                    {professionalTitle}
                  </h2>
                </div>

                <dl className="grid grid-cols-3 gap-2">
                  <IdentityStat
                    label="Years"
                    value={`${yearsOfExperience}+`}
                  />
                  <IdentityStat label="Builds" value={String(projectCount)} />
                  <IdentityStat
                    label="Core"
                    value={coreSkills.length.toString().padStart(2, "0")}
                  />
                </dl>
              </div>

              {coreSkills.length ? (
                <div className="mt-auto">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--accent)] uppercase">
                        {labels.core}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        {labels.coreDescription}
                      </p>
                    </div>
                    <Link
                      className="group inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
                      href="/skills"
                      aria-label={labels.link}
                    >
                      <ArrowUpRight
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        size={14}
                      />
                    </Link>
                  </div>

                  <ol className="relative space-y-0 border-l border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] pl-4">
                    {coreSkills.map((skill, index) => (
                      <li className="relative py-2 first:pt-0 last:pb-0" key={skill.id}>
                        <span
                          aria-hidden
                          className="absolute top-1/2 -left-4 size-2 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-[var(--accent)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        <div className="flex items-center gap-3">
                          <span className="w-5 shrink-0 font-mono text-[10px] tracking-[0.08em] text-[var(--muted)]">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <TechnologyMark
                            iconUrl={skill.icon}
                            name={skill.name}
                            slug={skill.slug}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold tracking-tight">
                              {skill.name}
                            </p>
                            <p className="truncate font-mono text-[10px] tracking-[0.06em] text-[var(--muted)] uppercase">
                              {skill.categoryName}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="flex min-h-[22rem] min-w-0 flex-col lg:min-h-0">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2.5 sm:px-4">
              <h3 className="text-base font-semibold">{labels.inventory}</h3>
              <span className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[7px] tracking-[0.08em] text-[var(--muted)] uppercase">
                {labels.scroll} ↓
              </span>
            </header>

            <div
              aria-label="Complete technology inventory. Scroll vertically to explore all skill domains."
              className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
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

function IdentityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] px-2.5 py-2 backdrop-blur-[2px]">
      <dd className="text-lg leading-none font-semibold tracking-[-0.04em]">
        {value}
      </dd>
      <dt className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[var(--muted)] uppercase">
        {label}
      </dt>
    </div>
  );
}
