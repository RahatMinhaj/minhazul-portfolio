import Link from "next/link";

import {
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTERVIEW_LEARNING_SOURCES,
  INTERVIEW_LEARNING_STATUSES,
} from "@/features/interview-prep/interview-prep-types";
import {
  saveLearningItemAction,
  scanPortfolioGapsAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewLearningItems,
  getAdminInterviewTopics,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewPrepLearningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    params.status &&
    (INTERVIEW_LEARNING_STATUSES as readonly string[]).includes(params.status)
      ? (params.status as (typeof INTERVIEW_LEARNING_STATUSES)[number])
      : undefined;

  const [topics, { items }] = await Promise.all([
    getAdminInterviewTopics(),
    getAdminInterviewLearningItems({ status, page, pageSize: 30 }),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <AdminMutationForm action={scanPortfolioGapsAction} submitLabel="Scan gaps" />
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Learning" },
        ]}
        description="Gap queue from portfolio, exams, and AI. Accept an item, generate a pack, practice questions land in the library."
        title="Learning queue"
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5 text-sm sm:w-48">
              <span className="font-medium">Status</span>
              <select className={selectClass} defaultValue={status ?? ""} name="status">
                <option value="">All open-ish</option>
                {INTERVIEW_LEARNING_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <Button size="sm" type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add learning item</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={saveLearningItemAction}
              className="grid gap-4"
              submitLabel="Add to queue"
            >
              <AdminField label="Title" name="title" required />
              <AdminTextarea label="Description" name="description" rows={3} />
              <AdminField label="Related skill name" name="relatedSkillName" />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Topic</span>
                <select className={selectClass} name="topicId">
                  <option value="">None</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Source</span>
                <select className={selectClass} defaultValue="MANUAL" name="source">
                  {INTERVIEW_LEARNING_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <AdminField
                defaultValue={1}
                label="Priority"
                max={10}
                min={0}
                name="priority"
                type="number"
              />
            </AdminMutationForm>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <Link
                key={item.id}
                className="block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]"
                href={`/admin/interview-prep/learning/${item.id}`}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="neutral">{item.status}</Badge>
                  <Badge variant="neutral">{item.source}</Badge>
                  {item.relatedSkillName ? (
                    <Badge>{item.relatedSkillName}</Badge>
                  ) : null}
                  <Badge variant="neutral">P{item.priority}</Badge>
                </div>
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                ) : null}
                {item.contents.length ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {item.contents.length} generated content block
                    {item.contents.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-sm text-[var(--muted)]">
                Queue empty. Scan portfolio gaps or add manually.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
