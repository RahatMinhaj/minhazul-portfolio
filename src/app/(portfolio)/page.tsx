import {
  ArrowRight,
  Award,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CodeXml,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquareText,
  Rocket,
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
import { HeroExperience } from "@/components/home/hero-experience";
import { InteractiveLinkCard } from "@/components/home/interactive-link-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils/date";
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

  return (
    <main id="main-content" className="relative isolate overflow-hidden">
      <div className="theme-environment absolute inset-0 -z-20" aria-hidden />
      <div className="pointer-aura fixed inset-0 -z-10" aria-hidden />

      <HeroExperience
        availability={profile?.availabilityStatus ?? "Currently employed"}
        currentFocus={
          profile?.currentFocus ??
          "Enterprise applications, distributed systems, and AI integrations."
        }
        experienceCount={experiences.length}
        fullName={profile?.fullName ?? "Minhazul Islam"}
        professionalTitle={
          profile?.professionalTitle ?? "Full Stack Java Developer"
        }
        projectCount={projects.length}
        resumeUrl={profile?.resumeUrl ?? settings?.resumeUrl ?? null}
        shortBio={
          profile?.shortBio ??
          "Building robust and scalable software with Java, Spring Boot, Angular, microservices, distributed systems, and AI integrations."
        }
        technologies={highlightedTechnologies}
      />

      <section
        className="landing-section border-t border-[var(--border)]"
        id="about-overview"
      >
        <Container>
          <SectionHeading
            description="A practical engineering mindset shaped by enterprise systems, production support, distributed architecture, and applied AI."
            eyebrow="01 / About"
            href="/about"
            linkLabel="Read my story"
            title="I turn complex requirements into maintainable systems."
          />
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <InteractiveLinkCard cursorLabel="About me" href="/about">
              <Sparkles
                className="mb-12 text-[var(--accent)]"
                aria-hidden
                size={24}
              />
              <p className="max-w-3xl text-2xl leading-9 font-medium tracking-tight text-balance sm:text-3xl sm:leading-11">
                {profile?.shortBio ??
                  "Full-stack engineering across backend, frontend, architecture, and AI."}
              </p>
              <p className="mt-8 max-w-2xl leading-7 text-[var(--muted)]">
                {profile?.currentFocus ??
                  "Focused on reliable enterprise software and thoughtful technical execution."}
              </p>
            </InteractiveLinkCard>
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  label: "Professional roles",
                  value: experiences.length,
                  icon: BriefcaseBusiness,
                },
                {
                  label: "Selected systems",
                  value: projects.length,
                  icon: Boxes,
                },
                {
                  label: "Verified skills",
                  value: skillCount,
                  icon: CodeXml,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem
                    className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
                    key={stat.label}
                  >
                    <div>
                      <p className="text-3xl font-semibold">{stat.value}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {stat.label}
                      </p>
                    </div>
                    <Icon
                      className="text-[var(--accent)]"
                      aria-hidden
                      size={22}
                    />
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </Container>
      </section>

      <section
        className="landing-section landing-section-alt"
        id="experience-overview"
      >
        <Container>
          <SectionHeading
            description="Roles where backend engineering, frontend delivery, microservices, production operations, and mentorship meet."
            eyebrow="02 / Experience"
            href="/experience"
            linkLabel="Full timeline"
            title="Engineering experience, shown in context."
          />
          <StaggerContainer className="grid gap-5 lg:grid-cols-2">
            {experiences.map((experience) => (
              <StaggerItem key={experience.id}>
                <InteractiveLinkCard
                  cursorLabel="View timeline"
                  href="/experience"
                >
                  <div className="mb-10 flex flex-wrap items-center gap-2">
                    {experience.currentlyWorking ? (
                      <Badge>Current</Badge>
                    ) : null}
                    <Badge variant="neutral">
                      {formatMonthYear(experience.startDate)} —{" "}
                      {experience.currentlyWorking
                        ? "Present"
                        : formatMonthYear(experience.endDate)}
                    </Badge>
                  </div>
                  <BriefcaseBusiness
                    className="mb-5 text-[var(--accent)]"
                    aria-hidden
                    size={21}
                  />
                  <h3 className="pr-7 text-2xl font-semibold tracking-tight">
                    {experience.position}
                  </h3>
                  <p className="mt-2 text-[var(--accent)]">
                    {experience.company}
                  </p>
                  <p className="mt-5 line-clamp-3 leading-7 text-[var(--muted)]">
                    {experience.summary}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-7">
                    {experience.technologies.slice(0, 5).map((technology) => (
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

      <section className="landing-section" id="projects-overview">
        <Container>
          <SectionHeading
            description="Enterprise platforms and domain systems built with security, scale, integration, and maintainability in mind."
            eyebrow="03 / Projects"
            href="/projects"
            linkLabel="Explore all projects"
            title="Selected systems built for real operations."
          />
          <StaggerContainer className="grid gap-5 md:grid-cols-2">
            {projects.slice(0, 4).map((project, index) => (
              <StaggerItem key={project.id}>
                <InteractiveLinkCard
                  cursorLabel="Open case study"
                  href={`/projects/${project.slug}`}
                >
                  <div className="mb-14 flex items-center justify-between pr-8">
                    <span className="font-mono text-xs text-[var(--accent)]">
                      PROJECT / {String(index + 1).padStart(2, "0")}
                    </span>
                    <Rocket
                      className="text-[var(--muted)]"
                      aria-hidden
                      size={18}
                    />
                  </div>
                  <h3 className="max-w-xl text-2xl font-semibold tracking-tight">
                    {project.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 leading-7 text-[var(--muted)]">
                    {project.shortDescription}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-7">
                    {project.technologies.slice(0, 6).map((technology) => (
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

      <section
        className="landing-section landing-section-alt"
        id="skills-overview"
      >
        <Container>
          <SectionHeading
            description="Not percentage bars—a connected view of the technologies used across backend, frontend, data, architecture, AI, and delivery."
            eyebrow="04 / Skills"
            href="/skills"
            linkLabel="Open skill map"
            title="A stack shaped by production engineering."
          />
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillCategories.map((category) => (
              <StaggerItem key={category.id}>
                <InteractiveLinkCard
                  cursorLabel="Explore skills"
                  href="/skills"
                >
                  <CodeXml
                    className="mb-9 text-[var(--accent)]"
                    aria-hidden
                    size={20}
                  />
                  <div className="flex items-baseline justify-between gap-4 pr-7">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {category.skills.length}
                    </span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
                    {category.skills.slice(0, 7).map((skill) => (
                      <span
                        className="text-sm text-[var(--muted)]"
                        key={skill.id}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </InteractiveLinkCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      <section className="landing-section" id="learning-overview">
        <Container>
          <SectionHeading
            description="Verified learning records and academic foundations, preserving unknown dates rather than filling them with assumptions."
            eyebrow="05 / Learning"
            href="/certifications"
            linkLabel="View credentials"
            title="Education backed by verifiable records."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <ScrollReveal className="space-y-4">
              <div className="mb-6 flex items-center gap-3">
                <Award className="text-[var(--accent)]" aria-hidden size={20} />
                <h3 className="text-xl font-semibold">Certifications</h3>
              </div>
              {certifications.map((certification) => (
                <InteractiveLinkCard
                  cursorLabel="View credentials"
                  href="/certifications"
                  key={certification.id}
                >
                  <p className="font-mono text-xs text-[var(--accent)]">
                    {certification.issuer}
                  </p>
                  <h4 className="mt-4 pr-7 text-xl font-semibold">
                    {certification.name}
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {certification.description}
                  </p>
                </InteractiveLinkCard>
              ))}
            </ScrollReveal>
            <ScrollReveal className="space-y-4">
              <div className="mb-6 flex items-center gap-3">
                <GraduationCap
                  className="text-[var(--accent)]"
                  aria-hidden
                  size={21}
                />
                <h3 className="text-xl font-semibold">Education</h3>
              </div>
              {education.map((item) => (
                <InteractiveLinkCard
                  cursorLabel="View education"
                  href="/education"
                  key={item.id}
                >
                  <p className="font-mono text-xs text-[var(--accent)]">
                    {item.institution}
                  </p>
                  <h4 className="mt-4 pr-7 text-xl font-semibold">
                    {item.degree}
                  </h4>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {item.field}
                  </p>
                </InteractiveLinkCard>
              ))}
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {settings?.blogEnabled !== false ? (
        <section
          className="landing-section landing-section-alt"
          id="blog-overview"
        >
          <Container>
            <SectionHeading
              description="Engineering notes, architecture decisions, implementation lessons, and ideas worth making reusable."
              eyebrow="06 / Blog"
              href="/blog"
              linkLabel="Read the blog"
              title="Technical thinking, documented."
            />
            {posts.length ? (
              <StaggerContainer className="grid gap-5 md:grid-cols-3">
                {posts.slice(0, 3).map((post) => (
                  <StaggerItem key={post.id}>
                    <InteractiveLinkCard
                      cursorLabel="Read article"
                      href={`/blog/${post.slug}`}
                    >
                      <BookOpen
                        className="mb-10 text-[var(--accent)]"
                        aria-hidden
                        size={21}
                      />
                      <h3 className="pr-7 text-xl font-semibold">
                        {post.title}
                      </h3>
                      <p className="mt-4 line-clamp-3 leading-7 text-[var(--muted)]">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-7">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="neutral">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </InteractiveLinkCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <InteractiveLinkCard cursorLabel="Open blog" href="/blog">
                <BookOpen
                  className="mb-10 text-[var(--accent)]"
                  aria-hidden
                  size={24}
                />
                <h3 className="text-2xl font-semibold">
                  The publication queue is being prepared.
                </h3>
                <p className="mt-4 text-[var(--muted)]">
                  The blog section is live and ready for the first published
                  engineering note.
                </p>
              </InteractiveLinkCard>
            )}
          </Container>
        </section>
      ) : null}

      <section className="landing-section" id="explore-overview">
        <Container>
          <SectionHeading
            description="A closer look at the tools behind the work and a hands-on space for safe developer-focused interactions."
            eyebrow="07 / Explore"
            href="/playground"
            linkLabel="Enter playground"
            title="The setup and the experimental side."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <InteractiveLinkCard cursorLabel="View my tools" href="/uses">
              <Wrench
                className="mb-14 text-[var(--accent)]"
                aria-hidden
                size={24}
              />
              <p className="eyebrow">Uses / Toolkit</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                The tools behind the delivery.
              </h3>
              <p className="mt-5 leading-7 text-[var(--muted)]">
                {useItems.length
                  ? `${useItems.length} verified tools across the working environment.`
                  : "Frameworks, IDEs, delivery tools, and AI assistants extracted from the verified technical profile."}
              </p>
            </InteractiveLinkCard>
            {settings?.playgroundEnabled !== false ? (
              <InteractiveLinkCard
                cursorLabel="Launch playground"
                href="/playground"
              >
                <TerminalSquare
                  className="mb-14 text-[var(--accent)]"
                  aria-hidden
                  size={25}
                />
                <p className="eyebrow">Playground / Interactive</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Terminal, architecture, and a typing challenge.
                </h3>
                <p className="mt-5 leading-7 text-[var(--muted)]">
                  Explore the portfolio through safe commands, inspect system
                  layers, or try a lightweight developer mini-game.
                </p>
              </InteractiveLinkCard>
            ) : null}
          </div>
        </Container>
      </section>

      {settings?.contactEnabled !== false ? (
        <section
          className="landing-section landing-contact"
          id="contact-overview"
        >
          <Container>
            <ScrollReveal className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-7 shadow-[var(--shadow-card)] sm:p-12 lg:p-16">
              <div className="landing-contact-orb" aria-hidden />
              <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="eyebrow">08 / Contact</p>
                  <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl">
                    Have a system worth building?
                    <span className="block text-[var(--accent)]">
                      Let&apos;s make it reliable.
                    </span>
                  </h2>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                    Start a conversation about enterprise software,
                    architecture, backend systems, full-stack delivery, or
                    applied AI.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
                    {profile?.email ? (
                      <span className="inline-flex items-center gap-2">
                        <Mail aria-hidden size={15} />
                        {profile.email}
                      </span>
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
                    <Link data-cursor="Open résumé" href="/resume">
                      View résumé
                      <ArrowRight aria-hidden size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
              {socialLinks.length ? (
                <div className="relative z-10 mt-10 flex flex-wrap gap-4 border-t border-[var(--border)] pt-7">
                  {socialLinks.map((link) => (
                    <a
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                      data-cursor={`Open ${link.label}`}
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
