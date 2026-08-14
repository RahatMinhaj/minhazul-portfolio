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
              <AdminField label="Icon key · optional" name="icon" />
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
                  label="Logo URL · optional"
                  name="icon"
                  type="url"
                />
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
            <CardContent className="space-y-5">
              <details className="rounded-lg border border-[var(--border)] p-4">
                <summary className="text-sm font-medium text-[var(--accent)]">
                  Edit category
                </summary>
                <AdminMutationForm
                  action={saveSkillCategoryAction}
                  className="mt-4 grid gap-4"
                  submitLabel="Update category"
                >
                  <input name="id" type="hidden" value={category.id} />
                  <AdminField
                    defaultValue={category.name}
                    label="Name"
                    name="name"
                    required
                  />
                  <AdminField
                    defaultValue={category.slug}
                    label="Slug"
                    name="slug"
                    required
                  />
                  <AdminTextarea
                    defaultValue={category.description ?? undefined}
                    label="Description"
                    name="description"
                    rows={3}
                  />
                  <AdminField
                    defaultValue={category.icon ?? undefined}
                    label="Icon key · optional"
                    name="icon"
                  />
                  <AdminField
                    defaultValue={category.sortOrder}
                    label="Sort order"
                    name="sortOrder"
                    type="number"
                  />
                  <AdminCheckbox
                    defaultChecked={category.visible}
                    label="Visible"
                    name="visible"
                  />
                </AdminMutationForm>
              </details>
              {category.skills.map((skill) => (
                <details
                  className="rounded-lg border border-[var(--border)] p-4"
                  key={skill.id}
                >
                  <summary className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-medium">{skill.name}</span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {skill.visible ? "Visible" : "Hidden"}
                        {skill.highlighted ? " · Core" : ""}
                      </span>
                    </span>
                    <span className="text-xs text-[var(--accent)]">Edit</span>
                  </summary>
                  <AdminMutationForm
                    action={saveSkillAction}
                    className="mt-4 grid gap-4"
                    submitLabel="Update skill"
                  >
                    <input name="id" type="hidden" value={skill.id} />
                    <label className="space-y-2 text-sm">
                      <span className="font-medium">Category</span>
                      <select
                        className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                        defaultValue={skill.categoryId}
                        name="categoryId"
                      >
                        {categories.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <AdminField
                      defaultValue={skill.name}
                      label="Name"
                      name="name"
                      required
                    />
                    <AdminField
                      defaultValue={skill.slug}
                      label="Slug"
                      name="slug"
                      required
                    />
                    <AdminField
                      defaultValue={skill.icon ?? undefined}
                      label="Logo URL · optional"
                      name="icon"
                      type="url"
                    />
                    <AdminField
                      defaultValue={skill.proficiency ?? undefined}
                      label="Proficiency · optional 0–100"
                      name="proficiency"
                      type="number"
                    />
                    <AdminField
                      defaultValue={skill.sortOrder}
                      label="Sort order"
                      name="sortOrder"
                      type="number"
                    />
                    <div className="flex gap-5">
                      <AdminCheckbox
                        defaultChecked={skill.highlighted}
                        label="Highlighted"
                        name="highlighted"
                      />
                      <AdminCheckbox
                        defaultChecked={skill.visible}
                        label="Visible"
                        name="visible"
                      />
                    </div>
                  </AdminMutationForm>
                  <AdminMutationForm
                    action={deleteSkillAction}
                    className="mt-3"
                    confirmMessage="Delete this skill?"
                    submitLabel="Delete skill"
                  >
                    <input name="id" type="hidden" value={skill.id} />
                  </AdminMutationForm>
                </details>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
