import type { Metadata } from "next";
import { Code2, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { ProjectVisual } from "@/components/projects/project-visual";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getVisibleProjectBySlug } from "@/server/queries/public-content";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getVisibleProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getVisibleProjectBySlug(slug);

  if (!project) notFound();

  const sections: Array<{ label: string; content: unknown }> = [
    { label: "Problem", content: project.problemStatement },
    { label: "Solution", content: project.solution },
    { label: "Architecture", content: project.architecture },
    { label: "Challenges", content: project.challenges },
    { label: "Outcomes", content: project.outcomes },
  ].filter((section) => Boolean(section.content));

  return (
    <main id="main-content">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteConfig.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Projects",
              item: `${siteConfig.url}/projects`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: project.title,
              item: `${siteConfig.url}/projects/${project.slug}`,
            },
          ],
        }}
      />
      <PageHero
        description={project.shortDescription}
        eyebrow="Case study"
        status={project.status}
        title={project.title}
      />
      <Container className="py-16 sm:py-24">
        <ProjectVisual
          className="mb-10 min-h-72 rounded-[var(--radius-card)] border border-[var(--border-strong)] shadow-[var(--shadow-card)] sm:min-h-96"
          projectType={project.projectType}
        />
        <div className="mb-12 flex flex-col gap-6 border-b border-[var(--border)] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((item) => (
                <Badge key={item} variant="neutral">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
              {project.role ? <span>Role: {project.role}</span> : null}
              {project.companyName ? (
                <span>Company: {project.companyName}</span>
              ) : null}
              {project.clientName ? (
                <span>Client: {project.clientName}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {project.githubUrl ? (
              <Button asChild variant="outline">
                <a href={project.githubUrl} rel="noreferrer" target="_blank">
                  <Code2 aria-hidden size={16} />
                  Source
                </a>
              </Button>
            ) : null}
            {project.liveUrl ? (
              <Button asChild>
                <a href={project.liveUrl} rel="noreferrer" target="_blank">
                  Live system
                  <ExternalLink aria-hidden size={15} />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        {project.richDescription ? (
          <article className="mx-auto max-w-3xl">
            <RichTextDocument document={project.richDescription} />
          </article>
        ) : null}
        {sections.length ? (
          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {sections.map(({ label, content }) => (
              <Card key={label}>
                <CardHeader>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {label}
                  </h2>
                </CardHeader>
                <CardContent>
                  {typeof content === "string" ? (
                    <p className="leading-7 text-[var(--muted)]">{content}</p>
                  ) : (
                    <RichTextDocument document={content} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </Container>
    </main>
  );
}
