import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteTopicAction,
  saveTopicAction,
} from "@/server/actions/admin-interview-prep";
import { getAdminInterviewTopics } from "@/server/queries/admin-content";

export default async function InterviewPrepTopicsPage() {
  const topics = await getAdminInterviewTopics();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Topics" },
        ]}
        description="Curriculum tree for navigating the question bank."
        title="Topics"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add topic</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={saveTopicAction}
              className="grid gap-4"
              submitLabel="Create topic"
            >
              <AdminField label="Name" name="name" required />
              <AdminField
                label="Slug · auto from name if empty"
                name="slug"
              />
              <AdminTextarea label="Description" name="description" rows={3} />
              <AdminField
                defaultValue={topics.length}
                label="Sort order"
                min={0}
                name="sortOrder"
                type="number"
              />
              <AdminCheckbox defaultChecked label="Visible" name="visible" />
            </AdminMutationForm>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{topic.name}</p>
                    <p className="text-xs text-[var(--muted)]">{topic.slug}</p>
                    {topic.description ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">{topic.description}</p>
                    ) : null}
                  </div>
                  <Badge variant="neutral">{topic._count.questions} Q</Badge>
                </div>
                <AdminMutationForm
                  action={saveTopicAction}
                  className="grid gap-3"
                  submitLabel="Update"
                >
                  <input name="id" type="hidden" value={topic.id} />
                  <AdminField defaultValue={topic.name} label="Name" name="name" required />
                  <AdminField defaultValue={topic.slug} label="Slug" name="slug" required />
                  <AdminTextarea
                    defaultValue={topic.description ?? ""}
                    label="Description"
                    name="description"
                    rows={2}
                  />
                  <AdminField
                    defaultValue={topic.sortOrder}
                    label="Sort order"
                    name="sortOrder"
                    type="number"
                  />
                  <AdminCheckbox
                    defaultChecked={topic.visible}
                    label="Visible"
                    name="visible"
                  />
                </AdminMutationForm>
                <AdminMutationForm
                  action={deleteTopicAction}
                  confirmMessage="Delete this topic? Questions become uncategorized."
                  submitLabel="Delete"
                >
                  <input name="id" type="hidden" value={topic.id} />
                </AdminMutationForm>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
