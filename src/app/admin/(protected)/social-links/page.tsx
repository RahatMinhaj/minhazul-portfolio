import { AdminCheckbox, AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteSocialLinkAction,
  saveSocialLinkAction,
} from "@/server/actions/admin-taxonomy";
import { getAdminSocialLinks } from "@/server/queries/admin-content";

export default async function AdminSocialLinksPage() {
  const links = await getAdminSocialLinks();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Only validated external URLs are accepted. Hidden links remain private."
        title="Social links"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add social link</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMutationForm
            action={saveSocialLinkAction}
            className="grid gap-4 md:grid-cols-2"
            submitLabel="Create link"
          >
            <input name="id" type="hidden" value="" />
            <AdminField label="Platform" name="platform" required />
            <AdminField label="Label" name="label" required />
            <AdminField label="URL" name="url" required type="url" />
            <AdminField label="Icon key" name="icon" />
            <AdminField
              defaultValue={0}
              label="Sort order"
              name="sortOrder"
              type="number"
            />
            <AdminCheckbox defaultChecked label="Visible" name="visible" />
          </AdminMutationForm>
        </CardContent>
      </Card>
      <div className="mt-8 space-y-4">
        {links.map((link) => (
          <Card key={link.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{link.label}</p>
                <p className="text-sm text-[var(--muted)]">{link.url}</p>
              </div>
              <AdminMutationForm
                action={deleteSocialLinkAction}
                confirmMessage="Delete this social link?"
                submitLabel="Delete"
              >
                <input name="id" type="hidden" value={link.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
