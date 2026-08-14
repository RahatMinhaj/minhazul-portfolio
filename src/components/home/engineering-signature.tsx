import {
  ArrowRight,
  BrainCircuit,
  Container,
  Database,
  MoveHorizontal,
  Network,
  PanelsTopLeft,
  Server,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import {
  siAngular,
  siAnthropic,
  siApache,
  siApachekafka,
  siApachemaven,
  siApachenetbeanside,
  siBootstrap,
  siCss,
  siCursor,
  siDocker,
  siGit,
  siGithub,
  siGitlab,
  siGradle,
  siHibernate,
  siHtml5,
  siIntellijidea,
  siJavascript,
  siJira,
  siJson,
  siJsonwebtokens,
  siMongodb,
  siMysql,
  siN8n,
  siOpenapiinitiative,
  siPostgresql,
  siPostman,
  siRabbitmq,
  siReact,
  siRedis,
  siRedmine,
  siSpring,
  siSpringboot,
  siSpringsecurity,
  siTypescript,
  siXml,
} from "simple-icons";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/primitives";

type StackCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    highlighted: boolean;
  }>;
};

type BrandIcon = {
  title: string;
  hex: string;
  path: string;
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

const technologyLogos: Record<string, BrandIcon> = {
  "spring-boot": siSpringboot,
  "spring-security": siSpringsecurity,
  "spring-mvc": siSpring,
  "spring-batch": siSpring,
  "spring-aop": siSpring,
  "spring-data-jpa": siSpring,
  hibernate: siHibernate,
  jwt: siJsonwebtokens,
  "restful-apis": siOpenapiinitiative,
  json: siJson,
  xml: siXml,
  maven: siApachemaven,
  gradle: siGradle,
  "apache-poi": siApache,
  "spring-cloud": siSpring,
  "apache-kafka": siApachekafka,
  rabbitmq: siRabbitmq,
  angular: siAngular,
  react: siReact,
  typescript: siTypescript,
  javascript: siJavascript,
  bootstrap: siBootstrap,
  html: siHtml5,
  css: siCss,
  redis: siRedis,
  mysql: siMysql,
  postgresql: siPostgresql,
  mongodb: siMongodb,
  "spring-ai": siSpring,
  n8n: siN8n,
  claude: siAnthropic,
  cursor: siCursor,
  docker: siDocker,
  git: siGit,
  github: siGithub,
  gitlab: siGitlab,
  jira: siJira,
  redmine: siRedmine,
  "intellij-idea": siIntellijidea,
  netbeans: siApachenetbeanside,
  "spring-tool-suite": siSpring,
  postman: siPostman,
};

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
  const totalSkills = categories.reduce(
    (total, category) => total + category.skills.length,
    0,
  );
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

      <ScrollReveal className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div
          className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--border)_50%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--border)_50%,transparent)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_42%)] bg-[size:28px_28px] opacity-25"
          aria-hidden
        />

        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-raised)_75%,transparent)] px-2.5 py-2 sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[var(--accent-foreground)]">
              <Sparkles aria-hidden size={12} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[7px] tracking-[0.16em] text-[var(--accent)] uppercase">
                Stack console / live index
              </p>
              <h2 className="truncate text-xs leading-4 font-semibold">
                {professionalTitle}
              </h2>
            </div>
          </div>
          <p className="hidden truncate font-mono text-[8px] text-[var(--muted)] sm:block">
            {fullName}
          </p>
          <dl className="flex overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface)]">
            <Stat value={`${yearsOfExperience}+`} label="YRS" />
            <Stat value={String(projectCount)} label="BLD" />
            <Stat value={String(totalSkills)} label="TEC" />
          </dl>
        </div>

        {coreSkills.length ? (
          <div className="relative grid border-b border-[var(--border)] md:grid-cols-[8rem_minmax(0,1fr)]">
            <div className="flex items-center justify-between gap-2 bg-[color-mix(in_srgb,var(--accent)_7%,var(--surface))] px-2.5 py-1.5 md:block md:border-r md:border-[var(--border)] md:py-2">
              <div>
                <p className="font-mono text-[7px] tracking-[0.15em] text-[var(--accent)] uppercase">
                  Priority lane
                </p>
                <h3 className="text-[10px] font-semibold">Core stack</h3>
              </div>
              <span className="font-mono text-[7px] text-[var(--muted)] uppercase md:mt-2 md:block">
                {coreSkills.length} highlighted
              </span>
            </div>

            <StaggerContainer
              aria-label="Core technologies"
              className="flex snap-x [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] gap-1 overflow-x-auto p-1.5"
              role="list"
              tabIndex={0}
            >
              {coreSkills.map((skill) => (
                <StaggerItem
                  className="min-w-32 flex-1 snap-start"
                  key={skill.id}
                  role="listitem"
                >
                  <div className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] px-1.5">
                    <TechnologyMark name={skill.name} slug={skill.slug} />
                    <div className="min-w-0">
                      <p className="truncate text-[9px] font-semibold">
                        {skill.name}
                      </p>
                      <p className="truncate font-mono text-[6px] tracking-[0.08em] text-[var(--muted)] uppercase">
                        {skill.categoryName}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ) : null}

        <div className="relative p-2.5 sm:p-3">
          <div className="mb-2 flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[7px] tracking-[0.15em] text-[var(--accent)] uppercase">
                Domain channels /{" "}
                {categories.length.toString().padStart(2, "0")}
              </p>
              <h3 className="text-xs font-semibold">
                Browse the complete stack
              </h3>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)] px-2.5 py-1 font-mono text-[7px] tracking-[0.08em] text-[var(--muted)] uppercase">
              <MoveHorizontal aria-hidden size={12} />
              Scroll domains
            </span>
          </div>

          <StaggerContainer
            aria-label="Skill domains. Scroll horizontally to browse."
            className="flex snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] gap-2 overflow-x-auto overscroll-x-contain pb-2"
            role="region"
            tabIndex={0}
          >
            {categories.map((category, categoryIndex) => {
              const Icon =
                stackIcons[category.slug as keyof typeof stackIcons] ?? Wrench;
              const skills = category.skills.toSorted(
                (left, right) =>
                  Number(right.highlighted) - Number(left.highlighted),
              );

              return (
                <StaggerItem
                  className="w-[min(78vw,18rem)] shrink-0 snap-start sm:w-72"
                  key={category.id}
                >
                  <article className="flex h-[18rem] flex-col overflow-hidden rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] shadow-[var(--shadow-control)]">
                    <header className="relative flex min-h-14 items-center gap-2 overflow-hidden border-b border-[var(--border)] px-2.5 py-2">
                      <span
                        className="absolute inset-y-0 left-0 w-0.5 bg-[var(--accent)]"
                        aria-hidden
                      />
                      <span className="grid size-7 shrink-0 place-items-center rounded-md border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] text-[var(--accent)]">
                        <Icon aria-hidden size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[6px] tracking-[0.15em] text-[var(--muted)] uppercase">
                          Channel{" "}
                          {(categoryIndex + 1).toString().padStart(2, "0")}
                        </p>
                        <h4 className="truncate text-[11px] leading-4 font-semibold">
                          {category.name}
                        </h4>
                      </div>
                      <span className="rounded-md bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] px-2 py-1 font-mono text-[7px] text-[var(--accent)]">
                        {skills.length.toString().padStart(2, "0")}
                      </span>
                    </header>

                    <div
                      aria-label={`${category.name} technologies. Scroll vertically to see all.`}
                      className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--accent)_transparent] overflow-y-auto overscroll-contain p-1.5 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset"
                      role="region"
                      tabIndex={0}
                    >
                      <ul className="grid grid-cols-2 gap-1">
                        {skills.map((skill) => (
                          <li
                            className={
                              skill.highlighted
                                ? "flex min-h-8 min-w-0 items-center gap-1 rounded-md border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_7%,var(--surface))] p-1"
                                : "flex min-h-8 min-w-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1"
                            }
                            key={skill.id}
                          >
                            <TechnologyMark
                              name={skill.name}
                              slug={skill.slug}
                            />
                            <span className="min-w-0 flex-1 text-[8px] leading-2.5 font-medium [overflow-wrap:anywhere]">
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
                    </div>

                    <footer className="flex items-center justify-between border-t border-[var(--border)] px-2.5 py-1.5 font-mono text-[6px] tracking-[0.1em] text-[var(--muted)] uppercase">
                      <span>{skills.length} technologies indexed</span>
                      <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                        Scroll list
                        <span aria-hidden>↕</span>
                      </span>
                    </footer>
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid min-w-16 place-content-center border-r border-[var(--border)] px-1.5 py-1 text-center last:border-r-0 sm:min-w-20">
      <dd className="text-xs font-semibold tracking-[-0.03em] sm:text-sm">
        {value}
      </dd>
      <dt className="font-mono text-[7px] tracking-[0.1em] text-[var(--muted)] uppercase">
        {label}
      </dt>
    </div>
  );
}

export function TechnologyMark({
  iconUrl,
  name,
  slug,
}: {
  iconUrl?: string | null;
  name: string;
  slug: string;
}) {
  const logo = technologyLogos[slug];
  const sizeClass = "size-5 rounded-sm";

  if (iconUrl) {
    return (
      <span
        className={`grid ${sizeClass} shrink-0 place-items-center overflow-hidden border border-black/10 bg-white p-0.5 shadow-sm`}
      >
        {/* Admin-managed URLs intentionally support arbitrary logo hosts. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="size-full object-contain" src={iconUrl} />
      </span>
    );
  }

  if (logo) {
    return (
      <span
        className={`grid ${sizeClass} shrink-0 place-items-center border border-black/10 bg-white p-1.5 shadow-sm`}
        title={`${logo.title} logo`}
      >
        <svg
          className="size-full"
          style={{ color: `#${logo.hex}` }}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d={logo.path} fill="currentColor" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`grid ${sizeClass} shrink-0 place-items-center border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] font-mono text-[8px] font-bold tracking-[-0.03em] text-[var(--accent)]`}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}

function getInitials(name: string) {
  const words = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
