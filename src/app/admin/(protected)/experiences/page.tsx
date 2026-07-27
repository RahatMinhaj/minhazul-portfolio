import type { Experience } from "@/generated/prisma/client";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteExperienceAction,
  saveExperienceAction,
} from "@/server/actions/admin-career";
import { getAdminExperiences } from "@/server/queries/admin-content";

export default async function AdminExperiencesPage() {
  const experiences = await getAdminExperiences();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Create, edit, order, feature, and control visibility for professional roles."
        title="Experience"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceForm />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-5">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader>
              <CardTitle>
                {experience.position} · {experience.company}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ExperienceForm experience={experience} />
              <AdminMutationForm
                action={deleteExperienceAction}
                confirmMessage="Delete this experience permanently?"
                submitLabel="Delete experience"
              >
                <input name="id" type="hidden" value={experience.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function ExperienceForm({ experience }: { experience?: Experience }) {
  return (
    <AdminMutationForm
      action={saveExperienceAction}
      className="grid gap-4 md:grid-cols-2"
      submitLabel={experience ? "Update experience" : "Create experience"}
    >
      <input name="id" type="hidden" value={experience?.id ?? ""} />
      <AdminField
        defaultValue={experience?.company}
        label="Company"
        name="company"
        required
      />
      <AdminField
        defaultValue={experience?.position}
        label="Position"
        name="position"
        required
      />
      <AdminField
        defaultValue={experience?.location ?? undefined}
        label="Location"
        name="location"
      />
      <AdminField
        defaultValue={experience?.sortOrder ?? 0}
        label="Sort order"
        name="sortOrder"
        type="number"
      />
      <AdminField
        defaultValue={dateInput(experience?.startDate)}
        label="Start date"
        name="startDate"
        type="date"
      />
      <AdminField
        defaultValue={dateInput(experience?.endDate)}
        label="End date"
        name="endDate"
        type="date"
      />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={experience?.summary ?? undefined}
          label="Summary"
          name="summary"
        />
      </div>
      <AdminTextarea
        defaultValue={experience?.achievements.join("\n")}
        label="Achievements · one per line"
        name="achievements"
      />
      <AdminTextarea
        defaultValue={experience?.technologies.join("\n")}
        label="Technologies · one per line"
        name="technologies"
      />
      <div className="flex flex-wrap gap-5 md:col-span-2">
        <AdminCheckbox
          defaultChecked={experience?.currentlyWorking}
          label="Current role"
          name="currentlyWorking"
        />
        <AdminCheckbox
          defaultChecked={experience?.featured}
          label="Featured"
          name="featured"
        />
        <AdminCheckbox
          defaultChecked={experience?.visible ?? true}
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
