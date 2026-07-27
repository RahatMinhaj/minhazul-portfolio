import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteUseItemAction,
  saveUseItemAction,
} from "@/server/actions/admin-taxonomy";
import { getAdminUseItems } from "@/server/queries/admin-content";

export default async function AdminUsesPage() {
  const items = await getAdminUseItems();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage the dynamic workstation, software, frameworks, cloud, and AI-tool inventory."
        title="Uses"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add uses item</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMutationForm
            action={saveUseItemAction}
            className="grid gap-4 md:grid-cols-2"
            submitLabel="Create item"
          >
            <input name="id" type="hidden" value="" />
            <AdminField label="Category" name="category" required />
            <AdminField label="Name" name="name" required />
            <div className="md:col-span-2">
              <AdminTextarea label="Description" name="description" />
            </div>
            <AdminField label="URL" name="url" type="url" />
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
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--muted)]">{item.category}</p>
              </div>
              <AdminMutationForm
                action={deleteUseItemAction}
                confirmMessage="Delete this uses item?"
                submitLabel="Delete"
              >
                <input name="id" type="hidden" value={item.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
