import { AdminField, AdminTextarea } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { saveProfileAction } from "@/server/actions/admin-profile";
import { getAdminProfile } from "@/server/queries/admin-content";

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage the verified identity, biography, contact, availability, and résumé shown publicly."
        title="Profile"
      />
      <Card>
        <CardContent className="p-6">
          <AdminMutationForm
            action={saveProfileAction}
            className="grid gap-5 md:grid-cols-2"
          >
            <AdminField
              defaultValue={profile?.fullName}
              label="Full name"
              name="fullName"
              required
            />
            <AdminField
              defaultValue={profile?.professionalTitle}
              label="Professional title"
              name="professionalTitle"
              required
            />
            <div className="md:col-span-2">
              <AdminTextarea
                defaultValue={profile?.shortBio}
                label="Short biography"
                name="shortBio"
                required
              />
            </div>
            <AdminField
              defaultValue={profile?.email ?? undefined}
              label="Public email"
              name="email"
              type="email"
            />
            <AdminField
              defaultValue={profile?.phone ?? undefined}
              label="Phone"
              name="phone"
            />
            <AdminField
              defaultValue={profile?.location ?? undefined}
              label="Location"
              name="location"
            />
            <AdminField
              defaultValue={profile?.availabilityStatus ?? undefined}
              label="Availability"
              name="availabilityStatus"
            />
            <AdminField
              defaultValue={profile?.currentCompany ?? undefined}
              label="Current company"
              name="currentCompany"
            />
            <AdminField
              defaultValue={profile?.currentRole ?? undefined}
              label="Current role"
              name="currentRole"
            />
            <AdminField
              defaultValue={profile?.yearsOfExperience?.toString()}
              label="Years of experience"
              name="yearsOfExperience"
              step="0.1"
              type="number"
            />
            <AdminField
              defaultValue={profile?.resumeUrl ?? undefined}
              label="Résumé URL"
              name="resumeUrl"
              type="url"
            />
            <AdminField
              defaultValue={profile?.currentFocus ?? undefined}
              label="Current focus"
              name="currentFocus"
            />
            <div className="mt-3 border-t border-[var(--border)] pt-7 md:col-span-2">
              <h2 className="text-xl font-semibold">
                Hero developer code block
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Customize the editable text in the animated code panel. The name
                and project count continue to update automatically.
              </p>
            </div>
            <AdminField
              defaultValue={
                profile?.heroContent.developerCode.fileLabel ??
                "minhazul.profile.ts"
              }
              label="Code file label"
              name="heroCodeFileLabel"
              required
            />
            <AdminField
              defaultValue={
                profile?.heroContent.developerCode.variableName ?? "developer"
              }
              label="Variable name"
              name="heroCodeVariableName"
              required
            />
            <AdminField
              defaultValue={
                profile?.heroContent.developerCode.focus ?? "enterprise + AI"
              }
              label="Focus value"
              name="heroCodeFocus"
              required
            />
            <AdminField
              defaultValue={
                profile?.heroContent.developerCode.status ?? "building"
              }
              label="Status value"
              name="heroCodeStatus"
              required
            />
          </AdminMutationForm>
        </CardContent>
      </Card>
    </main>
  );
}
