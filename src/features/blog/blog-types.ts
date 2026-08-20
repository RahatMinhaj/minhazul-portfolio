import type { RichTextDocument } from "@/lib/content/rich-text";

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogPostWriteInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: RichTextDocument;
  tags: string[];
  status: BlogPostStatus;
  readingTime: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featured: boolean;
  coverImage?: string | null;
};
