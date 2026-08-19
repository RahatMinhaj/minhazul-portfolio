import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CodeXml,
  Database,
  ExternalLink,
  Layers3,
  Mail,
  MapPin,
  MessageSquareText,
  Network,
  Server,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/primitives";
import {
  EducationRecords,
  type EducationRecord,
} from "@/components/education/education-records";
import { CompactSectionHeader } from "@/components/home/compact-section-header";
import { EngineeringSignature } from "@/components/home/engineering-ledger";
import { HeroExperience } from "@/components/home/hero-experience";
import { InteractiveLinkCard } from "@/components/home/interactive-link-card";
import { ProjectVisual } from "@/components/projects/project-visual";
import { ProjectJourney } from "@/components/home/project-journey";
import {
  Chronology,
  type ChronologyItem,
} from "@/components/shared/chronology";
import { Container } from "@/components/shared/container";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils/date";
import { defaultHeroContent } from "@/features/profile/hero-content";
import {
  getPublishedPosts,
  getPublicProfile,
  getPublicSiteSettings,
  getVisibleCertifications,
  getVisibleEducation,
  getVisibleExperiences,
  getVisibleProjects,
  getVisibleSkillCategories,
  getVisibleSocialLinks,
  getVisibleUseItems,
} from "@/server/queries/public-content";

const capabilityIcons = [
  Server,
  Network,
  CodeXml,
  Database,
  BrainCircuit,
  Layers3,
];

export default async function Home() {
  const [
    profile,
    experiences,
    projects,
    skillCategories,
    certifications,
    education,
    posts,
    useItems,
    socialLinks,
    settings,
  ] = await Promise.all([
    getPublicProfile(),
    getVisibleExperiences(),
    getVisibleProjects(),
    getVisibleSkillCategories(),
    getVisibleCertifications(),
    getVisibleEducation(),
    getPublishedPosts(),
    getVisibleUseItems(),
    getVisibleSocialLinks(),
    getPublicSiteSettings(),
  ]);
  const highlightedTechnologies = skillCategories
    .flatMap((category) => category.skills)
    .filter((skill) => skill.highlighted)
    .slice(0, 7)
    .map((skill) => skill.name);
  const skillCount = skillCategories.reduce(
    (total, category) => total + category.skills.length,
    0,
  );
  const experienceItems: ChronologyItem[] = experiences
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      period: item.startDate
        ? `${formatMonthYear(item.startDate)} - ${item.currentlyWorking ? "Present" : item.endDate ? formatMonthYear(item.endDate) : ""}`
        : undefined,
      title: item.position,
      organization: item.company,
      description: item.richDescription ? (
        <RichTextDocument document={item.richDescription} />
      ) : null,
      highlights: item.achievements,
      technologies: item.technologies,
      current: item.currentlyWorking,
    }));
  const publicEducation = education.filter(
    (item) => item.degree.toLowerCase() !== "needs confirmation",
  );
  const educationRecords: EducationRecord[] = publicEducation
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      institution: item.institution,
      logo: item.logo,
      degree: item.degree,
      field: item.field,
      period: item.startDate
        ? `${formatMonthYear(item.startDate)} - ${item.endDate ? formatMonthYear(item.endDate) : "Present"}`
        : undefined,
    }));
  const latestPost = posts[0];
  const heroCode =
    profile?.heroContent.developerCode ?? defaultHeroContent.developerCode;
  const exploreEnabled =
    (settings?.blogEnabled !== false && Boolean(latestPost)) ||
    settings?.playgroundEnabled !== false ||
    useItems.length > 0;

  return (
    <main id="main-content" className="relative isolate overflow-hidden">
      <div className="theme-environment absolute inset-0 -z-20" aria-hidden />

      <HeroExperience
        availability={profile?.availabilityStatus ?? "Currently employed"}
        currentFocus={
          profile?.currentFocus ??
          "Enterprise applications, distributed systems, and AI integrations."
        }
        fullName={profile?.fullName ?? "Minhazul Islam"}
        professionalTitle={
          profile?.professionalTitle ?? "Full Stack Java Developer"
        }
        shortBio={
          profile?.shortBio ??
          "Building robust and scalable software with Java, Spring Boot, Angular, microservices, distributed systems, and AI integrations."
        }
        technologies={highlightedTechnologies}
        codeFileLabel={heroCode.fileLabel}
        codeVariableName={heroCode.variableName}
        codeProperties={heroCode.properties}
      />

      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
        <EngineeringSignature
          categories={skillCategories}
          fullName={profile?.fullName ?? "Minhazul Islam"}
          labels={{
            section:
              settings?.engineeringSectionLabel ?? "01 / Engineering signature",
            link: settings?.engineeringLinkLabel ?? "Full skill map",
            core: settings?.engineeringCoreLabel ?? "Core strengths",
            inventory:
              settings?.engineeringInventoryLabel ?? "Technology inventory",
            scroll: settings?.engineeringScrollLabel ?? "Scroll to explore",
          }}
          professionalTitle={
            profile?.professionalTitle ?? "Full Stack Java Developer"
          }
          projectCount={projects.length}
          yearsOfExperience={
            profile?.yearsOfExperience?.toString() ?? experiences.length
          }
        />
      </div>

      {/* Selected Work is intentionally hidden; set this condition to true to restore it. */}
      {false && (
        <section
          className="landing-section border-t border-[var(--border)]"
          id="work-overview"
        >
          <Container>
            <CompactSectionHeader
              eyebrow="02 / Selected work"
              href="/projects"
              linkLabel="View all systems"
            />
            <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.slice(0, 3).map((project, index) => (
                <StaggerItem key={project.id}>
                  <InteractiveLinkCard
                    className="min-h-full"
                    cursorLabel="Open case study"
                    href={`/projects/${project.slug}`}
                  >
                    <ProjectVisual
                      className="-mx-6 -mt-6 mb-6"
                      index={index}
                      projectType={project.projectType}
                    />
                    <div className="flex flex-wrap items-center gap-2 pr-8">
                      {project.featured ? <Badge>Featured</Badge> : null}
                      {project.projectType ? (
                        <Badge variant="neutral">{project.projectType}</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                      {project.title}
                    </h3>
                    <p className="mt-4 line-clamp-3 leading-7 text-[var(--muted)]">
                      {project.shortDescription}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-7">
                      {project.technologies.slice(0, 5).map((technology) => (
                        <Badge key={technology} variant="neutral">
                          {technology}
                        </Badge>
                      ))}
                    </div>
                  </InteractiveLinkCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </section>
      )}

      <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12">
        <ProjectJourney projects={projects} />
      </div>

      {experienceItems.length ? (
        <section className="landing-section" id="experience-overview">
          <Container>
            <CompactSectionHeader
              eyebrow="04 / Career"
              href="/experience"
              linkLabel="Open full timeline"
            />
            <div className="grid gap-10 xl:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] xl:gap-16">
              <ScrollReveal>
                <div className="sticky top-28 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
                  <BriefcaseBusiness
                    className="text-[var(--accent)]"
                    aria-hidden
                    size={24}
                  />
                  <p className="mt-8 text-4xl font-semibold">
                    {profile?.yearsOfExperience
                      ? `${profile.yearsOfExperience}+`
                      : experiences.length}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {profile?.yearsOfExperience
                      ? "Years of professional engineering"
                      : "Career chapters"}
                  </p>
                  <div className="mt-8 border-t border-[var(--border)] pt-6">
                    <p className="eyebrow">Working principle</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      Own the full path from requirement and system design to
                      release, observability, and production support.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <Chronology compact items={experienceItems} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Capabilities is intentionally hidden; set this condition to true to restore it. */}
      {false && (
        <section
          className="landing-section landing-section-alt"
          id="capabilities"
        >
          <Container>
            <CompactSectionHeader
              eyebrow="05 / Capabilities"
              href="/skills"
              linkLabel="Browse all skills"
            />
            <StaggerContainer className="capability-tree grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-3">
              {skillCategories.slice(0, 6).map((category, index) => {
                const Icon =
                  capabilityIcons[index % capabilityIcons.length] ?? Server;
                return (
                  <StaggerItem
                    className="group relative bg-[var(--surface)] p-6 sm:p-7"
                    key={category.id}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <span className="grid size-11 place-items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)] transition-transform group-hover:-translate-y-1">
                        <Icon aria-hidden size={20} />
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase">
                        {String(category.skills.length).padStart(2, "0")} skills
                      </span>
                    </div>
                    <h3 className="mt-8 text-xl font-semibold">
                      {category.name}
                    </h3>
                    {category.description ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {category.description}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] pt-5">
                      {category.skills.slice(0, 6).map((skill) => (
                        <span
                          className="text-xs text-[var(--muted)]"
                          key={skill.id}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
            <p className="mt-5 text-right font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase">
              {skillCount} technologies across {skillCategories.length} domains
            </p>
          </Container>
        </section>
      )}

      {publicEducation.length ? (
        <section className="landing-section" id="credentials-overview">
          <Container>
            <CompactSectionHeader
              eyebrow="06 / Education"
              href="/education"
              linkLabel="View academic path"
            />
            <ScrollReveal>
              <EducationRecords
                compact
                headingLevel={3}
                records={educationRecords}
              />
            </ScrollReveal>
          </Container>
        </section>
      ) : null}

      {certifications.length ? (
        <section
          className="landing-section landing-section-alt"
          id="certifications-overview"
        >
          <Container>
            <CompactSectionHeader
              eyebrow="07 / Certifications"
              href="/certifications"
              linkLabel="View all credentials"
            />
            <StaggerContainer className="grid gap-4 lg:grid-cols-2">
              {certifications.slice(0, 4).map((item, index) => (
                <StaggerItem key={item.id}>
                  <article className="group grid h-full min-h-56 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-strong)] sm:grid-cols-[7.5rem_minmax(0,1fr)]">
                    <div className="relative flex min-h-32 flex-col items-center justify-center overflow-hidden border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_7%,var(--surface-raised))] p-5 sm:min-h-full sm:border-r sm:border-b-0">
                      <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_64%)]"
                        aria-hidden
                      />
                      <span className="absolute top-3 left-3 font-mono text-[8px] tracking-[0.14em] text-[var(--muted)] uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.certificateImage ? (
                        <span className="relative grid size-20 place-items-center overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-white p-2 shadow-[var(--shadow-control)]">
                          {/* Admin-provided root-relative or HTTPS image URL. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={`${item.issuer} certification mark`}
                            className="max-h-full max-w-full object-contain"
                            src={item.certificateImage}
                          />
                        </span>
                      ) : (
                        <span className="relative grid size-20 place-items-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] text-xl font-semibold tracking-[-0.04em] text-[var(--accent)] shadow-[var(--shadow-control)]">
                          {issuerInitials(item.issuer)}
                        </span>
                      )}
                      <Award
                        className="absolute right-3 bottom-3 text-[var(--accent)] opacity-55"
                        aria-hidden
                        size={15}
                      />
                    </div>

                    <div className="flex min-w-0 flex-col p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="eyebrow">{item.issuer}</p>
                        {item.featured ? <Badge>Featured</Badge> : null}
                      </div>
                      <h3 className="mt-3 text-xl leading-7 font-semibold tracking-tight [overflow-wrap:anywhere]">
                        {item.name}
                      </h3>
                      {item.description ? (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                          {item.description}
                        </p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border)] pt-5">
                        <div className="space-y-1">
                          {item.category ? (
                            <p className="font-mono text-[9px] tracking-[0.1em] text-[var(--muted)] uppercase">
                              {item.category}
                            </p>
                          ) : null}
                          <p className="font-mono text-[9px] text-[var(--muted)]">
                            {item.issueDate
                              ? formatMonthYear(item.issueDate)
                              : item.credentialId
                                ? `ID ${item.credentialId}`
                                : "Verified credential"}
                          </p>
                        </div>
                        {item.credentialUrl ? (
                          <a
                            className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-strong)] px-3 text-xs font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)]"
                            href={item.credentialUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Verify
                            <ExternalLink aria-hidden size={12} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </section>
      ) : null}

      {exploreEnabled ? (
        <section className="landing-section" id="explore-overview">
          <Container>
            <CompactSectionHeader
              eyebrow="08 / Engineering lab"
              href={
                settings?.playgroundEnabled !== false ? "/playground" : "/uses"
              }
              linkLabel="Open the lab"
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {settings?.blogEnabled !== false && latestPost ? (
                <InteractiveLinkCard
                  cursorLabel="Read article"
                  href={`/blog/${latestPost.slug}`}
                >
                  <BookOpen
                    className="mb-12 text-[var(--accent)]"
                    aria-hidden
                    size={23}
                  />
                  <p className="eyebrow">Latest writing</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    {latestPost.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                    {latestPost.excerpt}
                  </p>
                </InteractiveLinkCard>
              ) : null}
              {useItems.length ? (
                <InteractiveLinkCard cursorLabel="View toolkit" href="/uses">
                  <Wrench
                    className="mb-12 text-[var(--accent)]"
                    aria-hidden
                    size={23}
                  />
                  <p className="eyebrow">Tools / Environment</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    A deliberate working toolkit.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {useItems.length} tools across development, delivery,
                    design, and focused engineering work.
                  </p>
                </InteractiveLinkCard>
              ) : null}
              {settings?.playgroundEnabled !== false ? (
                <InteractiveLinkCard
                  cursorLabel="Launch playground"
                  href="/playground"
                >
                  <TerminalSquare
                    className="mb-12 text-[var(--accent)]"
                    aria-hidden
                    size={24}
                  />
                  <p className="eyebrow">Interactive / Playground</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    Inspect, type, and experiment.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    Use a safe terminal, inspect technology relationships, or
                    try a developer-focused typing challenge.
                  </p>
                </InteractiveLinkCard>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {settings?.contactEnabled !== false ? (
        <section
          className="landing-section landing-contact"
          id="contact-overview"
        >
          <Container>
            <ScrollReveal className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-7 shadow-[var(--shadow-card)] sm:p-9">
              <div className="landing-contact-orb" aria-hidden />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className="text-[var(--accent)]"
                      aria-hidden
                      size={18}
                    />
                    <p className="eyebrow">09 / Start a conversation</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
                    {profile?.email ? (
                      <a
                        className="inline-flex items-center gap-2 hover:text-[var(--accent)]"
                        href={`mailto:${profile.email}`}
                      >
                        <Mail aria-hidden size={15} />
                        {profile.email}
                      </a>
                    ) : null}
                    {profile?.location ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPin aria-hidden size={15} />
                        {profile.location}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg">
                    <Link data-cursor="Start a conversation" href="/contact">
                      <MessageSquareText aria-hidden size={17} />
                      Contact me
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link data-cursor="Open resume" href="/resume">
                      View resume
                      <ArrowRight aria-hidden size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
              {socialLinks.length ? (
                <div className="relative z-10 mt-7 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5">
                  {socialLinks.map((link) => (
                    <a
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                      href={link.url}
                      key={link.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </ScrollReveal>
          </Container>
        </section>
      ) : null}
    </main>
  );
}

function issuerInitials(issuer: string) {
  return issuer
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
