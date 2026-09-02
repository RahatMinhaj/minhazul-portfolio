import Link from "next/link";

import { AdminField } from "@/components/admin/admin-fields";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InterviewPrepRedirectForm } from "@/components/admin/interview-prep-redirect-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EXAM_MODE_LABELS,
  INTERVIEW_EXAM_MODES,
} from "@/features/interview-prep/interview-prep-types";
import { startExamAction } from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewExams,
  getAdminInterviewPacks,
  getAdminInterviewTopics,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewPrepExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [topics, packs, { exams }] = await Promise.all([
    getAdminInterviewTopics(),
    getAdminInterviewPacks(),
    getAdminInterviewExams(page, 20),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Exams" },
        ]}
        description="Random, weak, due, topic, and pack drills. Self-grade or let AI grade against reference answers."
        title="Exams"
      />

      <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Start exam</CardTitle>
          </CardHeader>
          <CardContent>
            <InterviewPrepRedirectForm
              action={startExamAction}
              className="grid gap-4"
              redirectToPrefix="/admin/interview-prep/exams"
              submitLabel="Begin exam"
            >
              <label className="space-y-2 text-sm">
                <span className="font-medium">Mode</span>
                <select className={selectClass} defaultValue="WEAK_FOCUS" name="mode">
                  {INTERVIEW_EXAM_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {EXAM_MODE_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </label>
              <AdminField
                defaultValue={10}
                label="Question count"
                max={30}
                min={1}
                name="questionCount"
                type="number"
              />
              <AdminField
                defaultValue={0}
                description="0 = untimed. Auto-submits when time hits zero."
                label="Time limit · minutes"
                max={180}
                min={0}
                name="timeLimitMinutes"
                type="number"
              />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Pack · for pack focus</span>
                <select className={selectClass} name="packId">
                  <option value="">None</option>
                  {packs.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.title} ({pack._count.items})
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Topics · for topic focus</legend>
                <div className="max-h-48 space-y-2 overflow-auto rounded-[var(--radius-control)] border border-[var(--border)] p-3">
                  {topics.map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 text-sm">
                      <input name="topicIds" type="checkbox" value={topic.id} />
                      {topic.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            </InterviewPrepRedirectForm>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {exams.length ? (
            exams.map((exam) => (
              <Link
                key={exam.id}
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm hover:border-[var(--accent)]"
                href={`/admin/interview-prep/exams/${exam.id}`}
              >
                <div>
                  <p className="font-medium">{EXAM_MODE_LABELS[exam.mode]}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {exam.questionCount} questions ·{" "}
                    {exam.startedAt.toLocaleString()}
                  </p>
                </div>
                <Badge variant={exam.status === "COMPLETED" ? "default" : "neutral"}>
                  {exam.status === "COMPLETED" && exam.scorePct != null
                    ? `${exam.scorePct}%`
                    : exam.status}
                </Badge>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-sm text-[var(--muted)]">
                No exams yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
