"use client";

import { useMemo, useState } from "react";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AiProviderSelect } from "@/components/admin/ai-provider-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  INTERVIEW_MASTERIES,
  MASTERY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/features/interview-prep/interview-prep-types";
import {
  bulkGenerateAnswersAction,
  bulkUpdateQuestionsAction,
} from "@/server/actions/admin-interview-prep";
import Link from "next/link";

type QuestionRow = {
  id: string;
  prompt: string;
  difficulty: string;
  mastery: keyof typeof MASTERY_LABELS;
  questionType: keyof typeof QUESTION_TYPE_LABELS;
  starred: boolean;
  topicName: string | null;
  hasAnswer: boolean;
};

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export function InterviewLibraryBulkList({
  questions,
  topics,
}: {
  questions: QuestionRow[];
  topics: Array<{ id: string; name: string }>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const allIds = useMemo(() => questions.map((q) => q.id), [questions]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelected((prev) => (prev.length === allIds.length ? [] : allIds));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[var(--muted)]">
              {selected.length} selected · bulk update / generate
            </p>
            <button
              className="text-xs underline"
              onClick={toggleAll}
              type="button"
            >
              {selected.length === allIds.length ? "Clear all" : "Select all"}
            </button>
          </div>

          <AdminMutationForm
            action={bulkUpdateQuestionsAction}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            submitLabel="Apply bulk update"
          >
            {selected.map((id) => (
              <input key={id} name="ids" type="hidden" value={id} />
            ))}
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Move topic</span>
              <select className={selectClass} name="topicId">
                <option value="">Keep topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Add tags</span>
              <input
                className={selectClass}
                name="addTags"
                placeholder="concurrency, nestjs"
              />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Mastery</span>
              <select className={selectClass} name="mastery">
                <option value="">Keep mastery</option>
                {INTERVIEW_MASTERIES.map((m) => (
                  <option key={m} value={m}>
                    {MASTERY_LABELS[m]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Starred</span>
              <select className={selectClass} name="starred">
                <option value="">Keep</option>
                <option value="true">Star</option>
                <option value="false">Unstar</option>
              </select>
            </label>
          </AdminMutationForm>

          <AdminMutationForm
            action={bulkGenerateAnswersAction}
            className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
            submitLabel="Generate answers"
          >
            {selected.map((id) => (
              <input key={`g-${id}`} name="ids" type="hidden" value={id} />
            ))}
            <AiProviderSelect />
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Limit</span>
              <input
                className={selectClass}
                defaultValue={5}
                max={10}
                min={1}
                name="limit"
                type="number"
              />
            </label>
          </AdminMutationForm>
          <p className="text-xs text-[var(--muted)]">
            If nothing is selected, generate uses the newest unanswered questions up to the limit.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {questions.map((question) => {
          const checked = selected.includes(question.id);
          return (
            <div
              key={question.id}
              className="flex gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <input
                checked={checked}
                className="mt-1"
                onChange={() => toggle(question.id)}
                type="checkbox"
              />
              <Link className="min-w-0 flex-1" href={`/admin/interview-prep/library/${question.id}`}>
                <div className="mb-2 flex flex-wrap gap-2">
                  {question.topicName ? (
                    <Badge variant="neutral">{question.topicName}</Badge>
                  ) : null}
                  <Badge variant="neutral">
                    {QUESTION_TYPE_LABELS[question.questionType]}
                  </Badge>
                  <Badge variant="neutral">{question.difficulty}</Badge>
                  <Badge variant="neutral">{MASTERY_LABELS[question.mastery]}</Badge>
                  {question.hasAnswer ? null : <Badge>No answer</Badge>}
                  {question.starred ? <Badge>Starred</Badge> : null}
                </div>
                <p className="text-sm leading-6">{question.prompt}</p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
