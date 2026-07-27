import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import {
  getPublishedPosts,
  getPublicSiteSettings,
} from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical writing, architecture notes, and engineering lessons.",
};

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    getPublishedPosts(),
    getPublicSiteSettings(),
  ]);
  if (settings && !settings.blogEnabled) notFound();

  return (
    <main id="main-content">
      <PageHero
        description="Published technical notes and long-form explanations. Drafts remain private inside the administration system."
        eyebrow="Writing / Engineering notes"
        status={`${posts.length} published`}
        title="Ideas worth documenting."
      />
      <Container className="py-16 sm:py-24">
        {posts.length === 0 ? (
          <EmptyState
            description="No articles have been published. Draft content is never exposed on this route."
            title="The publication queue is empty."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Card className="flex flex-col" key={post.id}>
                <CardHeader>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.featured ? <Badge>Featured</Badge> : null}
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto font-mono text-xs text-[var(--muted)]">
                  {formatDate(post.publishedAt)}
                  {post.readingTime ? ` · ${post.readingTime} min read` : ""}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
