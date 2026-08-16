import { AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  registerMediaAction,
  uploadMediaAction,
} from "@/server/actions/admin-media";
import { getAdminMedia } from "@/server/queries/admin-content";

export default async function AdminMediaPage() {
  const assets = await getAdminMedia();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Upload images to persistent server storage or register validated remote image URLs."
        title="Media"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload image</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={uploadMediaAction}
              className="grid gap-4"
              submitLabel="Upload image"
            >
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Image file</span>
                <input
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="block w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--surface-raised)] file:px-3 file:py-2"
                  name="image"
                  required
                  type="file"
                />
              </label>
              <AdminField
                label="Meaningful alternative text"
                name="altText"
                required
              />
            </AdminMutationForm>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Register image URL</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={registerMediaAction}
              className="grid gap-4"
              submitLabel="Register URL"
            >
              <input name="provider" type="hidden" value="url" />
              <AdminField
                label="Remote image URL"
                name="url"
                required
                type="url"
              />
              <AdminField
                label="Meaningful alternative text"
                name="altText"
                required
              />
            </AdminMutationForm>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 space-y-3">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                {/* Registered media intentionally supports administrator-controlled hosts. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="size-12 rounded-lg border border-[var(--border)] bg-white object-contain p-1"
                  src={asset.url}
                />
                <p className="font-medium">{asset.altText}</p>
              </div>
              <p className="mt-1 text-xs break-all text-[var(--muted)]">
                {asset.provider} · {asset.url}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
