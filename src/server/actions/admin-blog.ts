"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { deleteBlogPost, saveBlogPost } from "@/features/blog/blog.service";
import { requireAdmin } from "@/lib/auth/session";
import {
  failure,
  idSchema,
  readStringList,
  slugSchema,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const blogSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  title: z.string().trim().min(3).max(220),
  slug: slugSchema,
  excerpt: z.string().trim().min(20).max(600),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  readingTime: z.union([
    z.coerce.number().int().min(1).max(300),
    z.literal(""),
  ]),
  seoTitle: z.string().trim().max(160),
  seoDescription: z.string().trim().max(500),
});

export async function saveBlogPostAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = blogSchema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    status: formData.get("status"),
    readingTime: formData.get("readingTime") ?? "",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success) return failure("Blog-post validation failed.");

  const contentValue = formData.get("content");
  if (typeof contentValue !== "string")
    return failure("Article content missing.");

  let content: unknown;
  try {
    content = JSON.parse(contentValue);
  } catch {
    return failure("Article content is not valid rich-text JSON.");
  }
  if (!isRichDocument(content)) {
    return failure("Article content has an unsupported structure.");
  }

  const { id, readingTime, ...values } = parsed.data;
  const data = {
    ...values,
    content: content as Prisma.InputJsonValue,
    tags: readStringList(formData.get("tags")),
    readingTime: readingTime === "" ? null : readingTime,
    seoTitle: values.seoTitle || null,
    seoDescription: values.seoDescription || null,
    featured: formData.get("featured") === "on",
  };

  await saveBlogPost(id, data);
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  revalidatePath("/admin/blog");
  return success("Article saved.");
}

export async function deleteBlogPostAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid article.");
  await deleteBlogPost(id.data);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return success("Article deleted.");
}

function isRichDocument(value: unknown): value is {
  type: "doc";
  content: unknown[];
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const document = value as Record<string, unknown>;
  return document.type === "doc" && Array.isArray(document.content);
}
