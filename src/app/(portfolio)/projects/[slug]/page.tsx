import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/seo/structured-data";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ];

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
        <div className="mb-12 flex flex-wrap gap-2">
          {project.technologies.map((item) => (
            <Badge key={item} variant="neutral">
              {item}
            </Badge>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {sections.map(({ label, content }) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                {typeof content === "string" ? (
                  <p className="leading-7 text-[var(--muted)]">{content}</p>
                ) : content ? (
                  <RichTextDocument document={content} />
                ) : (
                  <EmptyState
                    description="This case-study field has not been confirmed."
                    title="Needs confirmation"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {project.richDescription ? (
          <article className="mx-auto mt-16 max-w-3xl">
            <RichTextDocument document={project.richDescription} />
          </article>
        ) : null}
      </Container>
    </main>
  );
}
