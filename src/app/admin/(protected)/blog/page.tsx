import Link from "next/link";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBlogPostAction } from "@/server/actions/admin-blog";
import { getAdminBlogPosts } from "@/server/queries/admin-content";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Create drafts, edit rich content, configure SEO, and publish only when ready."
        title="Blog"
      />
      <Card>
        <CardHeader>
          <CardTitle>Create article</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="mb-2 flex gap-2">
                  <Badge variant="neutral">{post.status}</Badge>
                  {post.featured ? <Badge>Featured</Badge> : null}
                </div>
                <p className="font-medium">{post.title}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  className="rounded-[var(--radius-control)] border border-[var(--border)] px-4 py-2 text-sm"
                  href={`/admin/blog/${post.id}`}
                >
                  Edit
                </Link>
                <AdminMutationForm
                  action={deleteBlogPostAction}
                  confirmMessage="Delete this article permanently?"
                  submitLabel="Delete"
                >
                  <input name="id" type="hidden" value={post.id} />
                </AdminMutationForm>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
