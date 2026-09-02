import Link from "next/link";
import { ClipboardPaste, Plus, Search } from "lucide-react";

import {
  AdminCheckbox,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AiProviderSelect } from "@/components/admin/ai-provider-select";
import { InterviewLibraryBulkList } from "@/components/admin/interview-library-bulk-list";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
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
  importBulkPasteAction,
  saveQuestionAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewQuestions,
  getAdminInterviewTopics,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewPrepLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const topics = await getAdminInterviewTopics();
  const { questions, total, pageSize } = await getAdminInterviewQuestions({
    search: params.search,
    topicId: params.topicId || undefined,
    mastery:
      params.mastery && (INTERVIEW_MASTERIES as readonly string[]).includes(params.mastery)
        ? (params.mastery as (typeof INTERVIEW_MASTERIES)[number])
        : undefined,
    difficulty:
      params.difficulty &&
      (INTERVIEW_DIFFICULTIES as readonly string[]).includes(params.difficulty)
        ? (params.difficulty as (typeof INTERVIEW_DIFFICULTIES)[number])
        : undefined,
    questionType:
      params.questionType &&
      (INTERVIEW_QUESTION_TYPES as readonly string[]).includes(params.questionType)
        ? (params.questionType as (typeof INTERVIEW_QUESTION_TYPES)[number])
        : undefined,
    starred: params.starred === "1",
    needsAnswer: params.needsAnswer === "1",
    page,
    pageSize: 20,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main id="main-content" className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="/api/admin/interview-prep/export">Export MD</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/api/admin/interview-prep/export?format=csv">Export CSV</a>
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Library" },
        ]}
        description="Paste dumps of questions (or Q+A). AI structures, organizes topics, polishes answers, and generates missing ones."
        title="Question library"
      />

      <div className="grid gap-6 lg:grid-cols-[26rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardPaste aria-hidden size={16} />
                Bulk paste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMutationForm
                action={importBulkPasteAction}
                className="grid gap-4"
                submitLabel="Structure & save"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium">Paste questions or Q+A</p>
                  <RichTextEditor
                    label="Bulk paste interview content"
                    name="rawText"
                  />
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Paste rich content (headings, lists, bold, Q/A). Exact HTML is
                  sent to Gemini — structure is preserved, not flattened to plain
                  text. Prefer Gemini for large pastes.
                </p>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Default topic · fallback</span>
                  <select className={selectClass} name="defaultTopicId">
                    <option value="">Let AI pick / uncategorized</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </label>
                <AiProviderSelect defaultValue="gemini" />
                <AdminCheckbox
                  defaultChecked
                  label="Generate answers when missing (up to 15)"
                  name="generateMissingAnswers"
                />
                <AdminCheckbox
                  defaultChecked
                  label="Polish pasted answers into structured rich text"
                  name="polishExistingAnswers"
                />
                <p className="text-xs text-[var(--muted)]">
                  Max 25 questions per paste. Large dumps upload as HTML to Gemini.
                  Keep the tab open while it runs.
                </p>
              </AdminMutationForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus aria-hidden size={16} />
                Single question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMutationForm
                action={saveQuestionAction}
                className="grid gap-4"
                submitLabel="Save question"
              >
                <AdminTextarea label="Question" name="prompt" required rows={4} />
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Topic</span>
                  <select className={selectClass} name="topicId">
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
                  <select className={selectClass} defaultValue="CONCEPTUAL" name="questionType">
                    {INTERVIEW_QUESTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Difficulty</span>
                  <select className={selectClass} defaultValue="MEDIUM" name="difficulty">
                    {INTERVIEW_DIFFICULTIES.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <AdminTextarea
                  label="Tags · comma or newline"
                  name="tags"
                  rows={2}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Answer · optional</p>
                  <RichTextEditor label="Answer" name="answer" />
                </div>
                <AdminCheckbox label="Starred" name="starred" />
              </AdminMutationForm>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="min-w-[14rem] flex-1 space-y-1.5 text-sm">
                  <span className="font-medium">Search</span>
                  <span className="relative block">
                    <Search
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted)]"
                    />
                    <input
                      className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] py-2 pr-3 pl-9 text-sm"
                      defaultValue={params.search}
                      name="search"
                      placeholder="Prompt or tag"
                    />
                  </span>
                </label>
                <label className="space-y-1.5 text-sm sm:w-44">
                  <span className="font-medium">Topic</span>
                  <select
                    className={selectClass}
                    defaultValue={params.topicId ?? ""}
                    name="topicId"
                  >
                    <option value="">All</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm sm:w-36">
                  <span className="font-medium">Mastery</span>
                  <select
                    className={selectClass}
                    defaultValue={params.mastery ?? ""}
                    name="mastery"
                  >
                    <option value="">All</option>
                    {INTERVIEW_MASTERIES.map((m) => (
                      <option key={m} value={m}>
                        {MASTERY_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <input
                    defaultChecked={params.needsAnswer === "1"}
                    name="needsAnswer"
                    type="checkbox"
                    value="1"
                  />
                  Needs answer
                </label>
                <Button size="sm" type="submit" variant="outline">
                  Filter
                </Button>
              </form>
            </CardContent>
          </Card>

          {questions.length ? (
            <InterviewLibraryBulkList
              questions={questions.map((question) => ({
                id: question.id,
                prompt: question.prompt,
                difficulty: question.difficulty,
                mastery: question.mastery,
                questionType: question.questionType,
                starred: question.starred,
                topicName: question.topic?.name ?? null,
                hasAnswer: Boolean(question.answers[0]),
              }))}
              topics={topics.map((topic) => ({ id: topic.id, name: topic.name }))}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-sm text-[var(--muted)]">
                No questions match. Bulk-paste on the left.
              </CardContent>
            </Card>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">
                Page {page} of {totalPages} · {total} total
              </span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`?page=${page - 1}`}>Previous</Link>
                  </Button>
                ) : null}
                {page < totalPages ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`?page=${page + 1}`}>Next</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
