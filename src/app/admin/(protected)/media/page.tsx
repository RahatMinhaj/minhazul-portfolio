import { AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerMediaAction } from "@/server/actions/admin-media";
import { getAdminMedia } from "@/server/queries/admin-content";

export default async function AdminMediaPage() {
  const assets = await getAdminMedia();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Register validated remote image URLs or root-relative local previews. Binary image data is never stored in PostgreSQL."
        title="Media"
      />
      <Card>
        <CardHeader>
          <CardTitle>Register asset</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMutationForm
            action={registerMediaAction}
            className="grid gap-4 md:grid-cols-2"
            submitLabel="Register media"
          >
            <label className="space-y-2 text-sm">
              <span className="font-medium">Provider</span>
              <select
                className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                name="provider"
              >
                <option value="url">Remote URL</option>
                <option value="local-preview">Local public preview</option>
              </select>
            </label>
            <AdminField label="URL or local path" name="url" required />
            <div className="md:col-span-2">
              <AdminField
                label="Meaningful alternative text"
                name="altText"
                required
              />
            </div>
          </AdminMutationForm>
        </CardContent>
      </Card>
      <div className="mt-8 space-y-3">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-5">
              <p className="font-medium">{asset.altText}</p>
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
