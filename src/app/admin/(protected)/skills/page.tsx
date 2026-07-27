import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteSkillAction,
  saveSkillAction,
  saveSkillCategoryAction,
} from "@/server/actions/admin-taxonomy";
import { getAdminSkills } from "@/server/queries/admin-content";

export default async function AdminSkillsPage() {
  const categories = await getAdminSkills();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage skill categories, editorial proficiency, highlighted capabilities, order, and visibility."
        title="Skills"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add category</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={saveSkillCategoryAction}
              className="grid gap-4"
              submitLabel="Create category"
            >
              <input name="id" type="hidden" value="" />
              <AdminField label="Name" name="name" required />
              <AdminField label="Slug" name="slug" required />
              <AdminTextarea label="Description" name="description" />
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
        <Card>
          <CardHeader>
            <CardTitle>Add skill</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length ? (
              <AdminMutationForm
                action={saveSkillAction}
                className="grid gap-4"
                submitLabel="Create skill"
              >
                <input name="id" type="hidden" value="" />
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Category</span>
                  <select
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                    name="categoryId"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <AdminField label="Name" name="name" required />
                <AdminField label="Slug" name="slug" required />
                <AdminField
                  label="Proficiency · optional 0–100"
                  name="proficiency"
                  type="number"
                />
                <AdminField
                  defaultValue={0}
                  label="Sort order"
                  name="sortOrder"
                  type="number"
                />
                <div className="flex gap-5">
                  <AdminCheckbox label="Highlighted" name="highlighted" />
                  <AdminCheckbox
                    defaultChecked
                    label="Visible"
                    name="visible"
                  />
                </div>
              </AdminMutationForm>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Create a category before adding skills.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.skills.map((skill) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-4"
                  key={skill.id}
                >
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {skill.visible ? "Visible" : "Hidden"}
                      {skill.highlighted ? " · Core" : ""}
                    </p>
                  </div>
                  <AdminMutationForm
                    action={deleteSkillAction}
                    confirmMessage="Delete this skill?"
                    submitLabel="Delete"
                  >
                    <input name="id" type="hidden" value={skill.id} />
                  </AdminMutationForm>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
