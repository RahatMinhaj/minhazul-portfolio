import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ShareActions } from "@/components/blog/share-actions";
import { PageHero } from "@/components/shared/page-hero";
import {
  getRichTextHeadings,
  RichTextDocument,
} from "@/components/shared/rich-text-document";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils/date";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
  getPublicSiteSettings,
} from "@/server/queries/public-content";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) return { title: "Article not found" };

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, posts, settings] = await Promise.all([
    getPublishedPostBySlug(slug),
    getPublishedPosts(),
    getPublicSiteSettings(),
  ]);

  if (!post || (settings && !settings.blogEnabled)) notFound();

  const headings = getRichTextHeadings(post.content);
  const relatedPosts = posts
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, 3);

  return (
    <main id="main-content">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt?.toISOString(),
            url: `${siteConfig.url}/blog/${post.slug}`,
          },
          {
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
                name: "Blog",
                item: `${siteConfig.url}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${siteConfig.url}/blog/${post.slug}`,
              },
            ],
          },
        ]}
      />
      <PageHero
        description={post.excerpt}
        eyebrow="Published article"
        status={
          post.readingTime
            ? `${post.readingTime} min read`
            : "Reading time pending"
        }
        title={post.title}
      />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center gap-2">
          <span className="mr-3 font-mono text-xs text-[var(--muted)]">
            {formatDate(post.publishedAt)}
          </span>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
          <div className="ml-auto">
            <ShareActions title={post.title} />
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[13rem_1fr]">
          {headings.length ? (
            <aside>
              <nav
                aria-label="Table of contents"
                className="sticky top-24 space-y-2"
              >
                <p className="mb-3 font-mono text-xs text-[var(--muted)] uppercase">
                  On this page
                </p>
                {headings.map((heading) => (
                  <a
                    className="block text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                    href={`#${heading.id}`}
                    key={heading.id}
                    style={{
                      paddingLeft: `${Math.max(0, heading.level - 2) * 0.75}rem`,
                    }}
                  >
                    {heading.label}
                  </a>
                ))}
              </nav>
            </aside>
          ) : (
            <div />
          )}
          <article className="max-w-3xl min-w-0">
            <RichTextDocument document={post.content} />
          </article>
        </div>
        {relatedPosts.length ? (
          <section className="mx-auto mt-20 max-w-6xl">
            <h2 className="mb-5 text-2xl font-semibold">Related articles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <Card key={related.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <Link href={`/blog/${related.slug}`}>
                        {related.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{related.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
