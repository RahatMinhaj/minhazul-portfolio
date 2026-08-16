import type { Certification } from "@/generated/prisma/client";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteCertificationAction,
  saveCertificationAction,
} from "@/server/actions/admin-career";
import {
  getAdminCertifications,
  getAdminMedia,
} from "@/server/queries/admin-content";

export default async function AdminCertificationsPage() {
  const [certifications, media] = await Promise.all([
    getAdminCertifications(),
    getAdminMedia(),
  ]);
  const mediaOptions = media.map(({ altText, url }) => ({ altText, url }));

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Maintain verified credentials, issuer details, dates, identifiers, and verification links."
        title="Certifications"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add certification</CardTitle>
        </CardHeader>
        <CardContent>
          <CertificationForm media={mediaOptions} />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-5">
        {certifications.map((certification) => (
          <Card key={certification.id}>
            <CardHeader>
              <CardTitle>{certification.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {certification.certificateImage ? (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                  {/* Admin-provided root-relative or HTTPS image URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${certification.issuer} logo preview`}
                    className="size-12 rounded-lg border border-[var(--border)] bg-white object-contain p-1.5"
                    src={certification.certificateImage}
                  />
                  <p className="min-w-0 truncate text-xs text-[var(--muted)]">
                    {certification.certificateImage}
                  </p>
                </div>
              ) : null}
              <CertificationForm
                certification={certification}
                media={mediaOptions}
              />
              <AdminMutationForm
                action={deleteCertificationAction}
                confirmMessage="Delete this certification?"
                submitLabel="Delete certification"
              >
                <input name="id" type="hidden" value={certification.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function CertificationForm({
  certification,
  media,
}: {
  certification?: Certification;
  media: Array<{ altText: string; url: string }>;
}) {
  return (
    <AdminMutationForm
      action={saveCertificationAction}
      className="grid gap-4 md:grid-cols-2"
      submitLabel={
        certification ? "Update certification" : "Create certification"
      }
    >
      <input name="id" type="hidden" value={certification?.id ?? ""} />
      <AdminField
        defaultValue={certification?.name}
        label="Name"
        name="name"
        required
      />
      <AdminField
        defaultValue={certification?.issuer}
        label="Issuer"
        name="issuer"
        required
      />
      <AdminField
        defaultValue={certification?.credentialId ?? undefined}
        label="Credential ID"
        name="credentialId"
      />
      <AdminField
        defaultValue={certification?.credentialUrl ?? undefined}
        label="Verification URL"
        name="credentialUrl"
        type="url"
      />
      <AdminField
        defaultValue={certification?.category ?? undefined}
        label="Category"
        name="category"
      />
      <AdminImageField
        defaultValue={certification?.certificateImage}
        label="Logo or certificate image"
        media={media}
        name="certificateImage"
      />
      <AdminField
        defaultValue={certification?.sortOrder ?? 0}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <AdminField
        defaultValue={dateInput(certification?.issueDate)}
        label="Issue date"
        name="issueDate"
        type="date"
      />
      <AdminField
        defaultValue={dateInput(certification?.expiryDate)}
        label="Expiry date"
        name="expiryDate"
        type="date"
      />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={certification?.description ?? undefined}
          label="Description"
          name="description"
        />
      </div>
      <div className="flex gap-5 md:col-span-2">
        <AdminCheckbox
          defaultChecked={certification?.featured}
          label="Featured"
          name="featured"
        />
        <AdminCheckbox
          defaultChecked={certification?.visible ?? true}
          label="Visible"
          name="visible"
        />
      </div>
    </AdminMutationForm>
  );
}

function dateInput(date?: Date | null) {
  return date?.toISOString().slice(0, 10);
}
