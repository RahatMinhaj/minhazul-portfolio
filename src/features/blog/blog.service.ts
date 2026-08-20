import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { blogRepository } from "@/features/blog/blog.repository";
import type { BlogPostWriteInput } from "@/features/blog/blog-types";

export async function saveBlogPost(id: string, input: BlogPostWriteInput) {
  const current = id ? await blogRepository.findPublication(id) : null;
  const data: Prisma.BlogPostUncheckedCreateInput = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content as Prisma.InputJsonValue,
    tags: input.tags,
    status: input.status,
    readingTime: input.readingTime,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    featured: input.featured,
    ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
    publishedAt:
      input.status === "PUBLISHED"
        ? (current?.publishedAt ?? new Date())
        : null,
  };

  return blogRepository.save(id, data);
}

export function deleteBlogPost(id: string) {
  return blogRepository.delete(id);
}
