import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { idSchema } from "@/server/actions/action-helpers";
import { getAdminBlogPosts } from "@/server/queries/admin-content";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const posts = await getAdminBlogPosts();
  const post = posts.find((item) => item.id === id);
  if (!post) notFound();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Blog", href: "/admin/blog" },
          { label: post.title },
        ]}
        description="Edit rich content, tags, publication state, and search metadata."
        title={post.title}
      />
      <Card>
        <CardContent className="p-6">
          <BlogPostForm post={post} />
        </CardContent>
      </Card>
    </main>
  );
}
