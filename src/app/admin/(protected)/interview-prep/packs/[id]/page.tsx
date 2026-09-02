import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InterviewPrepRedirectForm } from "@/components/admin/interview-prep-redirect-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_MODE_LABELS } from "@/features/interview-prep/interview-prep-types";
import {
  addQuestionToPackAction,
  deletePackAction,
  removeQuestionFromPackAction,
  savePackAction,
  startExamAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewPack,
  getAdminInterviewQuestionPicker,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pack, questions] = await Promise.all([
    getAdminInterviewPack(id),
    getAdminInterviewQuestionPicker(),
  ]);
  if (!pack) notFound();

  const packedIds = new Set(pack.items.map((item) => item.questionId));
  const available = questions.filter((q) => !packedIds.has(q.id));

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/interview-prep/packs">
              <ArrowLeft aria-hidden size={15} />
              Packs
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Packs", href: "/admin/interview-prep/packs" },
          { label: pack.title },
        ]}
        description={[pack.companyName, pack.roleTitle].filter(Boolean).join(" · ") || "Focused prep pack"}
        title={pack.title}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit pack</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={savePackAction}
              className="grid gap-4"
              submitLabel="Save pack"
            >
              <input name="id" type="hidden" value={pack.id} />
              <AdminField defaultValue={pack.title} label="Title" name="title" required />
              <AdminField
                defaultValue={pack.companyName ?? ""}
                label="Company"
                name="companyName"
              />
              <AdminField
                defaultValue={pack.roleTitle ?? ""}
                label="Role"
                name="roleTitle"
              />
              <AdminField
                defaultValue={
                  pack.targetDate ? pack.targetDate.toISOString().slice(0, 10) : ""
                }
                label="Target date"
                name="targetDate"
                type="date"
              />
              <AdminTextarea
                defaultValue={pack.notes ?? ""}
                label="Notes"
                name="notes"
                rows={3}
              />
              {pack.jobApplicationId ? (
                <input
                  name="jobApplicationId"
                  type="hidden"
                  value={pack.jobApplicationId}
                />
              ) : null}
            </AdminMutationForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start pack exam</CardTitle>
          </CardHeader>
          <CardContent>
            {pack.items.length ? (
              <InterviewPrepRedirectForm
                action={startExamAction}
                className="grid gap-4"
                redirectToPrefix="/admin/interview-prep/exams"
                submitLabel="Begin pack exam"
              >
                <input name="mode" type="hidden" value="PACK_FOCUS" />
                <input name="packId" type="hidden" value={pack.id} />
                <AdminField
                  defaultValue={Math.min(10, pack.items.length)}
                  label="Question count"
                  max={pack.items.length}
                  min={1}
                  name="questionCount"
                  type="number"
                />
                <AdminField
                  defaultValue={0}
                  label="Time limit · minutes (0 = off)"
                  max={180}
                  min={0}
                  name="timeLimitMinutes"
                  type="number"
                />
              </InterviewPrepRedirectForm>
            ) : (
              <p className="text-sm text-[var(--muted)]">Add questions before starting an exam.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add question</CardTitle>
        </CardHeader>
        <CardContent>
          {available.length ? (
            <AdminMutationForm
              action={addQuestionToPackAction}
              className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
              submitLabel="Add"
            >
              <input name="packId" type="hidden" value={pack.id} />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Library question</span>
                <select className={selectClass} name="questionId" required>
                  {available.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.topic?.name ? `${question.topic.name} · ` : ""}
                      {question.prompt.slice(0, 90)}
                    </option>
                  ))}
                </select>
              </label>
            </AdminMutationForm>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              All recent library questions are already in this pack, or the library is empty.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Pack questions · {pack.items.length}
        </h2>
        {pack.items.length ? (
          pack.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {item.question.topic ? (
                      <Badge variant="neutral">{item.question.topic.name}</Badge>
                    ) : null}
                    {!item.question.answers[0] ? <Badge>No answer</Badge> : null}
                  </div>
                  <Link
                    className="text-sm hover:underline"
                    href={`/admin/interview-prep/library/${item.questionId}`}
                  >
                    {item.question.prompt}
                  </Link>
                </div>
                <AdminMutationForm
                  action={removeQuestionFromPackAction}
                  submitLabel="Remove"
                >
                  <input name="packId" type="hidden" value={pack.id} />
                  <input name="questionId" type="hidden" value={item.questionId} />
                </AdminMutationForm>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-[var(--muted)]">
              No questions in this pack yet.
            </CardContent>
          </Card>
        )}
      </div>

      {pack.exams.length ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent pack exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pack.exams.map((exam) => (
              <Link
                key={exam.id}
                className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]"
                href={`/admin/interview-prep/exams/${exam.id}`}
              >
                <span>
                  {EXAM_MODE_LABELS[exam.mode]} · {exam.startedAt.toLocaleString()}
                </span>
                <Badge variant="neutral">
                  {exam.status === "COMPLETED" && exam.scorePct != null
                    ? `${exam.scorePct}%`
                    : exam.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminMutationForm
            action={deletePackAction}
            confirmMessage="Delete this pack? Questions stay in the library."
            submitLabel="Delete pack"
          >
            <input name="id" type="hidden" value={pack.id} />
          </AdminMutationForm>
        </CardContent>
      </Card>
    </main>
  );
}
