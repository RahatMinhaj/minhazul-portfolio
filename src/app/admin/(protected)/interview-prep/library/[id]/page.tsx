import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AiProviderSelect } from "@/components/admin/ai-provider-select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { RichTextHtml } from "@/components/admin/rich-text-html";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_MASTERIES,
  INTERVIEW_QUESTION_TYPES,
  MASTERY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/features/interview-prep/interview-prep-types";
import {
  deleteQuestionAction,
  generateAnswerAction,
  saveQuestionAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewQuestion,
  getAdminInterviewTopics,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [question, topics] = await Promise.all([
    getAdminInterviewQuestion(id),
    getAdminInterviewTopics(),
  ]);
  if (!question) notFound();

  const currentAnswer = question.answers.find((a) => a.isCurrent) ?? question.answers[0];

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/interview-prep/library">
              <ArrowLeft aria-hidden size={15} />
              Library
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Library", href: "/admin/interview-prep/library" },
          { label: "Question" },
        ]}
        description="Edit, generate a portfolio-grounded answer, and track mastery."
        title="Question detail"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {question.topic ? <Badge variant="neutral">{question.topic.name}</Badge> : null}
        <Badge variant="neutral">{QUESTION_TYPE_LABELS[question.questionType]}</Badge>
        <Badge variant="neutral">{question.difficulty}</Badge>
        <Badge variant="neutral">{MASTERY_LABELS[question.mastery]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={saveQuestionAction}
              className="grid gap-4"
              submitLabel="Save changes"
            >
              <input name="id" type="hidden" value={question.id} />
              <AdminTextarea
                defaultValue={question.prompt}
                label="Question"
                name="prompt"
                required
                rows={5}
              />
              <label className="space-y-2 text-sm">
                <span className="font-medium">Topic</span>
                <select
                  className={selectClass}
                  defaultValue={question.topicId ?? ""}
                  name="topicId"
                >
                  <option value="">Uncategorized</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Type</span>
                <select
                  className={selectClass}
                  defaultValue={question.questionType}
                  name="questionType"
                >
                  {INTERVIEW_QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {QUESTION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Difficulty</span>
                <select
                  className={selectClass}
                  defaultValue={question.difficulty}
                  name="difficulty"
                >
                  {INTERVIEW_DIFFICULTIES.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Mastery</span>
                <select
                  className={selectClass}
                  defaultValue={question.mastery}
                  name="mastery"
                >
                  {INTERVIEW_MASTERIES.map((m) => (
                    <option key={m} value={m}>
                      {MASTERY_LABELS[m]}
                    </option>
                  ))}
                </select>
              </label>
              <AdminField
                defaultValue={question.confidence ?? undefined}
                label="Confidence · 1–5"
                max={5}
                min={1}
                name="confidence"
                type="number"
              />
              <AdminTextarea
                defaultValue={question.tags.join(", ")}
                label="Tags"
                name="tags"
                rows={2}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Current answer</p>
                <RichTextEditor
                  contentKey={currentAnswer?.id ?? "new"}
                  initialContent={currentAnswer?.content}
                  label="Current answer"
                  name="answer"
                />
              </div>
              <AdminCheckbox
                defaultChecked={question.starred}
                label="Starred"
                name="starred"
              />
            </AdminMutationForm>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate answer</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMutationForm
                action={generateAnswerAction}
                className="grid gap-4"
                submitLabel="Generate & save"
              >
                <input name="id" type="hidden" value={question.id} />
                <p className="text-sm text-[var(--muted)]">
                  Uses your portfolio as the only factual source. May create follow-up questions
                  and learning gaps.
                </p>
                <AiProviderSelect />
              </AdminMutationForm>
            </CardContent>
          </Card>

          {currentAnswer ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Preview
                  {currentAnswer.generated ? (
                    <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                      AI · v{currentAnswer.version}
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                      Manual · v{currentAnswer.version}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextHtml content={currentAnswer.content} />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMutationForm
                action={deleteQuestionAction}
                confirmMessage="Delete this question and its answers?"
                submitLabel="Delete question"
              >
                <input name="id" type="hidden" value={question.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
