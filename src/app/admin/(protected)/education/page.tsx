import type { Education } from "@/generated/prisma/client";

import { AdminCheckbox, AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteEducationAction,
  saveEducationAction,
} from "@/server/actions/admin-career";
import {
  getAdminEducation,
  getAdminMedia,
} from "@/server/queries/admin-content";

export default async function AdminEducationPage() {
  const [records, media] = await Promise.all([
    getAdminEducation(),
    getAdminMedia(),
  ]);
  const mediaOptions = media.map(({ altText, url }) => ({ altText, url }));

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage verified institutions, degrees, fields, dates, grades, order, and visibility."
        title="Education"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add education</CardTitle>
        </CardHeader>
        <CardContent>
          <EducationForm media={mediaOptions} />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-5">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle>{record.degree}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {record.logo ? (
                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                  {/* Admin-provided root-relative or HTTPS image URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${record.institution} logo preview`}
                    className="size-12 rounded-lg border border-[var(--border)] bg-white object-contain p-1.5"
                    src={record.logo}
                  />
                  <p className="min-w-0 truncate text-xs text-[var(--muted)]">
                    {record.logo}
                  </p>
                </div>
              ) : null}
              <EducationForm education={record} media={mediaOptions} />
              <AdminMutationForm
                action={deleteEducationAction}
                confirmMessage="Delete this education record?"
                submitLabel="Delete education"
              >
                <input name="id" type="hidden" value={record.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function EducationForm({
  education,
  media,
}: {
  education?: Education;
  media: Array<{ altText: string; url: string }>;
}) {
  return (
    <AdminMutationForm
      action={saveEducationAction}
      className="grid gap-4 md:grid-cols-2"
      submitLabel={education ? "Update education" : "Create education"}
    >
      <input name="id" type="hidden" value={education?.id ?? ""} />
      <AdminField
        defaultValue={education?.institution}
        label="Institution"
        name="institution"
        required
      />
      <AdminField
        defaultValue={education?.degree}
        label="Degree"
        name="degree"
        required
      />
      <AdminField
        defaultValue={education?.field ?? undefined}
        label="Field"
        name="field"
      />
      <AdminField
        defaultValue={education?.grade ?? undefined}
        label="Grade"
        name="grade"
      />
      <AdminImageField
        defaultValue={education?.logo}
        label="Institution logo"
        media={media}
        name="logo"
      />
      <AdminField
        defaultValue={dateInput(education?.startDate)}
        label="Start date"
        name="startDate"
        type="date"
      />
      <AdminField
        defaultValue={dateInput(education?.endDate)}
        label="End date"
        name="endDate"
        type="date"
      />
      <AdminField
        defaultValue={education?.sortOrder ?? 0}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <AdminCheckbox
        defaultChecked={education?.visible ?? true}
        label="Visible"
        name="visible"
      />
    </AdminMutationForm>
  );
}

function dateInput(date?: Date | null) {
  return date?.toISOString().slice(0, 10);
}
