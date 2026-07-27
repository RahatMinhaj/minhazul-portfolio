import type { BlogPost } from "@/generated/prisma/client";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { saveBlogPostAction } from "@/server/actions/admin-blog";

export function BlogPostForm({ post }: { post?: BlogPost }) {
  return (
    <AdminMutationForm
      action={saveBlogPostAction}
      className="grid gap-5 md:grid-cols-2"
      submitLabel={post ? "Update article" : "Create article"}
    >
      <input name="id" type="hidden" value={post?.id ?? ""} />
      <AdminField
        defaultValue={post?.title}
        label="Title"
        name="title"
        required
      />
      <AdminField defaultValue={post?.slug} label="Slug" name="slug" required />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={post?.excerpt}
          label="Excerpt"
          name="excerpt"
          required
        />
      </div>
      <AdminField
        defaultValue={post?.tags.join("\n")}
        label="Tags · one per line"
        name="tags"
      />
      <AdminField
        defaultValue={post?.readingTime ?? undefined}
        label="Reading time"
        name="readingTime"
        type="number"
      />
      <label className="space-y-2 text-sm">
        <span className="font-medium">Status</span>
        <select
          className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
          defaultValue={post?.status ?? "DRAFT"}
          name="status"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>
      <AdminCheckbox
        defaultChecked={post?.featured}
        label="Featured"
        name="featured"
      />
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-medium">Article content</p>
        <RichTextEditor initialContent={post?.content} />
      </div>
      <AdminField
        defaultValue={post?.seoTitle ?? undefined}
        label="SEO title"
        name="seoTitle"
      />
      <AdminTextarea
        defaultValue={post?.seoDescription ?? undefined}
        label="SEO description"
        name="seoDescription"
      />
    </AdminMutationForm>
  );
}
