import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { Eye, Wrench } from "lucide-react";
import Link from "next/link";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { saveSettingsAction } from "@/server/actions/admin-settings";
import { getEmailSignature } from "@/features/settings/settings.service";
import { EmailSignatureEditor } from "@/components/admin/email-signature-editor";
import {
  getAdminSettings,
  getAdminThemes,
} from "@/server/queries/admin-content";

export default async function AdminSettingsPage() {
  const [settings, themes, emailSignature] = await Promise.all([
    getAdminSettings(),
    getAdminThemes(),
    getEmailSignature(),
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
            <div className="rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-raised)] p-5 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Wrench
                      className="text-[var(--accent)]"
                      aria-hidden
                      size={18}
                    />
                    <h2 className="font-semibold">Public maintenance mode</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Show a maintenance page to visitors while content is being
                    prepared. Signed-in administrators can still preview every
                    public page and feature.
                  </p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
                  href="/"
                  target="_blank"
                >
                  <Eye aria-hidden size={15} /> Preview site
                </Link>
              </div>
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <AdminCheckbox
                  defaultChecked={settings?.maintenanceMode}
                  label="Show maintenance page to public visitors"
                  name="maintenanceMode"
                />
              </div>
            </div>
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
                  "A verified developer-focused portfolio and technical resume."
                }
                label="Site description"
                name="siteDescription"
                required
              />
            </div>
            <AdminField
              defaultValue={settings?.seoTitle ?? undefined}
              label="SEO title"
              name="seoTitle"
            />
            <div className="border-t border-[var(--border)] pt-5 md:col-span-2">
              <h2 className="text-base font-semibold">Engineering signature</h2>
            </div>
            <AdminField
              defaultValue={
                settings?.engineeringSectionLabel ??
                "01 / Engineering signature"
              }
              label="Section label"
              name="engineeringSectionLabel"
              required
            />
            <AdminField
              defaultValue={settings?.engineeringLinkLabel ?? "Full skill map"}
              label="Skill-map link label"
              name="engineeringLinkLabel"
              required
            />
            <AdminField
              defaultValue={settings?.engineeringCoreLabel ?? "Core strengths"}
              label="Core skills label"
              name="engineeringCoreLabel"
              required
            />
            <AdminField
              defaultValue={
                settings?.engineeringInventoryLabel ?? "Technology inventory"
              }
              label="Inventory label"
              name="engineeringInventoryLabel"
              required
            />
            <AdminField
              defaultValue={
                settings?.engineeringScrollLabel ?? "Scroll to explore"
              }
              label="Scroll prompt"
              name="engineeringScrollLabel"
              required
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
            </div>
          </AdminMutationForm>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">Email Signature</h2>
          <EmailSignatureEditor emailSignature={emailSignature} />
        </CardContent>
      </Card>
    </main>
  );
}
