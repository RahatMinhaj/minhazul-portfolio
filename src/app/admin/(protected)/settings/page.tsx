import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { saveSettingsAction } from "@/server/actions/admin-settings";
import {
  getAdminSettings,
  getAdminThemes,
} from "@/server/queries/admin-content";

export default async function AdminSettingsPage() {
  const [settings, themes] = await Promise.all([
    getAdminSettings(),
    getAdminThemes(),
  ]);
  const fallbackTheme =
    themes.find((theme) => theme.isDefault)?.slug ?? "obsidian";

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage branding, SEO defaults, footer content, feature toggles, analytics, and maintenance state."
        title="Site settings"
      />
      <Card>
        <CardContent className="p-6">
          <AdminMutationForm
            action={saveSettingsAction}
            className="grid gap-5 md:grid-cols-2"
          >
            <AdminField
              defaultValue={settings?.siteName ?? "Developer Portfolio"}
              label="Site name"
              name="siteName"
              required
            />
            <AdminField
              defaultValue={settings?.defaultTheme ?? fallbackTheme}
              label="Default theme slug"
              name="defaultTheme"
              required
            />
            <div className="md:col-span-2">
              <AdminTextarea
                defaultValue={
                  settings?.siteDescription ??
                  "A verified developer-focused portfolio and technical résumé."
                }
                label="Site description"
                name="siteDescription"
                required
              />
            </div>
            <AdminField
              defaultValue={settings?.resumeUrl ?? undefined}
              label="Résumé URL"
              name="resumeUrl"
              type="url"
            />
            <AdminField
              defaultValue={settings?.seoTitle ?? undefined}
              label="SEO title"
              name="seoTitle"
            />
            <div className="md:col-span-2">
              <AdminTextarea
                defaultValue={settings?.seoDescription ?? undefined}
                label="SEO description"
                name="seoDescription"
              />
              <AdminTextarea
                defaultValue={settings?.footerText ?? undefined}
                label="Footer text"
                name="footerText"
              />
            </div>
            <div className="flex flex-wrap gap-5 md:col-span-2">
              <AdminCheckbox
                defaultChecked={settings?.contactEnabled ?? true}
                label="Contact"
                name="contactEnabled"
              />
              <AdminCheckbox
                defaultChecked={settings?.blogEnabled ?? true}
                label="Blog"
                name="blogEnabled"
              />
              <AdminCheckbox
                defaultChecked={settings?.playgroundEnabled ?? true}
                label="Playground"
                name="playgroundEnabled"
              />
              <AdminCheckbox
                defaultChecked={settings?.analyticsEnabled}
                label="Analytics"
                name="analyticsEnabled"
              />
              <AdminCheckbox
                defaultChecked={settings?.maintenanceMode}
                label="Maintenance mode"
                name="maintenanceMode"
              />
            </div>
          </AdminMutationForm>
        </CardContent>
      </Card>
    </main>
  );
}
