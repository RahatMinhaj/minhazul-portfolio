import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AiProviderSelect } from "@/components/admin/ai-provider-select";
import { ExamCountdown } from "@/components/admin/exam-countdown";
import { QuestionTimer } from "@/components/admin/question-timer";
import { RichTextHtml } from "@/components/admin/rich-text-html";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_MODE_LABELS } from "@/features/interview-prep/interview-prep-types";
import { submitExamAction } from "@/server/actions/admin-interview-prep";
import { getAdminInterviewExam } from "@/server/queries/admin-content";

export default async function InterviewExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getAdminInterviewExam(id);
  if (!exam) notFound();

  const isOpen = exam.status === "IN_PROGRESS";
  const formId = `exam-form-${exam.id}`;

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/interview-prep/exams">
              <ArrowLeft aria-hidden size={15} />
              Exams
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Exams", href: "/admin/interview-prep/exams" },
          { label: "Session" },
        ]}
        description={`${EXAM_MODE_LABELS[exam.mode]} · ${exam.questionCount} questions${
          exam.timeLimitSec ? ` · ${Math.round(exam.timeLimitSec / 60)} min` : ""
        }`}
        title={isOpen ? "Take exam" : "Exam review"}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="neutral">{exam.status}</Badge>
        {exam.scorePct != null ? <Badge>{exam.scorePct}%</Badge> : null}
        {exam.timeLimitSec ? (
          <Badge variant="neutral">{Math.round(exam.timeLimitSec / 60)} min limit</Badge>
        ) : null}
      </div>

      {isOpen && exam.timeLimitSec ? (
        <ExamCountdown
          formId={formId}
          startedAtIso={exam.startedAt.toISOString()}
          timeLimitSec={exam.timeLimitSec}
        />
      ) : null}

      {isOpen ? (
        <AdminMutationForm
          action={submitExamAction}
          className="space-y-6"
          confirmMessage="Submit this exam?"
          id={formId}
          submitLabel="Submit exam"
        >
          <input name="examId" type="hidden" value={exam.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grading</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <label className="flex items-start gap-2 text-sm">
                <input className="mt-1" defaultChecked name="useAiGrading" type="checkbox" />
                <span>
                  <span className="font-medium">AI grade answers</span>
                  <span className="mt-1 block text-[var(--muted)]">
                    Compares your answer to the reference. Self-grade is used as fallback if AI
                    fails. Uncheck to grade manually.
                  </span>
                </span>
              </label>
              <AiProviderSelect />
            </CardContent>
          </Card>

          {exam.items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Q{index + 1}. {item.promptSnapshot}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <input name="itemId" type="hidden" value={item.id} />
                <QuestionTimer itemId={item.id} />
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Your answer</span>
                  <textarea
                    className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm"
                    name={`answer_${item.id}`}
                    rows={6}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Self grade · used if AI off/fails</span>
                  <select
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm"
                    defaultValue="PARTIAL"
                    name={`result_${item.id}`}
                  >
                    <option value="CORRECT">Correct</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="INCORRECT">Incorrect</option>
                    <option value="SKIPPED">Skipped</option>
                  </select>
                </label>
                {item.expectedAnswerSnapshot ? (
                  <details className="rounded-[var(--radius-control)] border border-[var(--border)] p-3 text-sm">
                    <summary className="cursor-pointer font-medium">Reference answer</summary>
                    <div className="mt-3 text-[var(--muted)]">
                      <RichTextHtml content={item.expectedAnswerSnapshot} />
                    </div>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </AdminMutationForm>
      ) : (
        <div className="space-y-4">
          {exam.items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <span>
                    Q{index + 1}. {item.promptSnapshot}
                  </span>
                  <Badge variant="neutral">{item.result}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  {item.timeSpentSec != null ? (
                    <span>
                      Time spent: {Math.floor(item.timeSpentSec / 60)}m{" "}
                      {item.timeSpentSec % 60}s
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="mb-1 font-medium">Your answer</p>
                  <p className="whitespace-pre-wrap text-[var(--muted)]">
                    {item.userAnswer || "—"}
                  </p>
                </div>
                {item.aiFeedback ? (
                  <div>
                    <p className="mb-1 font-medium">AI feedback</p>
                    <p className="whitespace-pre-wrap text-[var(--muted)]">{item.aiFeedback}</p>
                  </div>
                ) : null}
                {item.expectedAnswerSnapshot ? (
                  <div>
                    <p className="mb-1 font-medium">Reference</p>
                    <div className="text-[var(--muted)]">
                      <RichTextHtml content={item.expectedAnswerSnapshot} />
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
