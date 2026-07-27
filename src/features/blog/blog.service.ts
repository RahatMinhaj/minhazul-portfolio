import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { blogRepository } from "@/features/blog/blog.repository";

type BlogWriteData = Omit<
  Prisma.BlogPostUncheckedCreateInput,
  "publishedAt"
> & {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export async function saveBlogPost(id: string, input: BlogWriteData) {
  const current = id ? await blogRepository.findPublication(id) : null;
  const data: Prisma.BlogPostUncheckedCreateInput = {
    ...input,
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
