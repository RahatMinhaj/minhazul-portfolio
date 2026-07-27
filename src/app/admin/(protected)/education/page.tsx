import type { Education } from "@/generated/prisma/client";

import { AdminCheckbox, AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteEducationAction,
  saveEducationAction,
} from "@/server/actions/admin-career";
import { getAdminEducation } from "@/server/queries/admin-content";

export default async function AdminEducationPage() {
  const records = await getAdminEducation();

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
          <EducationForm />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-5">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle>{record.degree}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <EducationForm education={record} />
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

function EducationForm({ education }: { education?: Education }) {
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
