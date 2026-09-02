import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { AdminField } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AiProviderSelect } from "@/components/admin/ai-provider-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERVIEW_LEARNING_STATUSES } from "@/features/interview-prep/interview-prep-types";
import {
  deleteLearningItemAction,
  generateLearningPackAction,
  promoteLearningToSkillAction,
  setLearningStatusAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewLearningItem,
  getAdminInterviewSkillCategories,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewLearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    getAdminInterviewLearningItem(id),
    getAdminInterviewSkillCategories(),
  ]);
  if (!item) notFound();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/interview-prep/learning">
              <ArrowLeft aria-hidden size={15} />
              Queue
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Learning", href: "/admin/interview-prep/learning" },
          { label: "Item" },
        ]}
        description={item.description ?? "Generate notes, cheatsheet, and practice questions."}
        title={item.title}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="neutral">{item.status}</Badge>
        <Badge variant="neutral">{item.source}</Badge>
        {item.relatedSkillName ? <Badge>{item.relatedSkillName}</Badge> : null}
        {item.topic ? <Badge variant="neutral">{item.topic.name}</Badge> : null}
        {item.skillId ? <Badge variant="default">Linked skill</Badge> : null}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={setLearningStatusAction}
              className="grid gap-3"
              submitLabel="Update status"
            >
              <input name="id" type="hidden" value={item.id} />
              <select
                className={selectClass}
                defaultValue={item.status}
                name="status"
              >
                {INTERVIEW_LEARNING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </AdminMutationForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate pack</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={generateLearningPackAction}
              className="grid gap-4"
              submitLabel="Generate & save"
            >
              <input name="id" type="hidden" value={item.id} />
              <p className="text-sm text-[var(--muted)]">
                Creates notes, cheatsheet, project idea, and practice questions in the library.
              </p>
              <AiProviderSelect />
            </AdminMutationForm>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Promote to portfolio skill</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length ? (
              <AdminMutationForm
                action={promoteLearningToSkillAction}
                className="grid gap-4 sm:grid-cols-2"
                submitLabel={item.skillId ? "Re-link skill" : "Create draft skill"}
              >
                <input name="learningItemId" type="hidden" value={item.id} />
                <AdminField
                  defaultValue={item.relatedSkillName ?? item.title}
                  label="Skill name"
                  name="skillName"
                />
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Category</span>
                  <select className={selectClass} name="categoryId" required>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <AdminField
                  defaultValue={20}
                  label="Starting proficiency"
                  max={100}
                  min={0}
                  name="proficiency"
                  type="number"
                />
                <p className="text-sm text-[var(--muted)] sm:col-span-2">
                  Creates a <strong>hidden</strong> draft skill (or links an existing one by name),
                  marks this learning item DONE, and leaves visibility for you to enable in Skills.
                </p>
              </AdminMutationForm>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Add a skill category first in{" "}
                <Link className="underline" href="/admin/skills">
                  Skills
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {item.contents.length ? (
          item.contents.map((content) => (
            <Card key={content.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {content.title}
                  <Badge variant="neutral">{content.kind}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{content.content}</ReactMarkdown>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-sm text-[var(--muted)]">
              No generated content yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMutationForm
            action={deleteLearningItemAction}
            confirmMessage="Delete this learning item and its content?"
            submitLabel="Delete"
          >
            <input name="id" type="hidden" value={item.id} />
          </AdminMutationForm>
        </CardContent>
      </Card>
    </main>
  );
}
