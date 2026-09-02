import Link from "next/link";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EXAM_MODE_LABELS,
  MASTERY_LABELS,
} from "@/features/interview-prep/interview-prep-types";
import type { InterviewMastery } from "@/generated/prisma/client";
import { syncAllJobGapsAction } from "@/server/actions/admin-interview-prep";
import { getAdminInterviewAnalytics } from "@/server/queries/admin-content";

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]">
      <div
        className="h-full rounded-full bg-[var(--accent)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function InterviewPrepAnalyticsPage() {
  const analytics = await getAdminInterviewAnalytics();
  const masteryMax = Math.max(1, ...analytics.mastery.map((m) => m.count));
  const weakMax = Math.max(1, ...analytics.weakTopics.map((t) => t.count));
  const scoreMax = 100;

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a href="/api/admin/interview-prep/export">Markdown</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/api/admin/interview-prep/export?format=csv">CSV</a>
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Analytics" },
        ]}
        description="Mastery mix, exam trend, weak topics, learning queue, and job-application gaps."
        title="Prep analytics"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{analytics.avgScore ?? "—"}%</p>
            <p className="text-xs text-[var(--muted)]">Avg exam score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{analytics.examsLast7Days}</p>
            <p className="text-xs text-[var(--muted)]">Exams last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{analytics.dueSoon}</p>
            <p className="text-xs text-[var(--muted)]">Due / due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{analytics.openJobGaps}</p>
            <p className="text-xs text-[var(--muted)]">Open job gaps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-semibold">{analytics.unsyncedJobApps}</p>
            <p className="text-xs text-[var(--muted)]">Apps needing sync</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Job application gaps</CardTitle>
          <AdminMutationForm
            action={syncAllJobGapsAction}
            submitLabel="Sync all gaps & interview points"
          />
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Imports `gaps` into the learning queue and `interviewPoints` into packs for each
            application that has those artifacts.
          </p>
          {analytics.jobApps.length ? (
            analytics.jobApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    className="font-medium hover:underline"
                    href={`/admin/job-applications/${app.id}`}
                  >
                    {app.companyName} · {app.roleTitle}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {app.gapCount} gaps · {app.interviewPointCount} interview points ·{" "}
                    {app.linkedLearningCount} linked learning
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={app.needsSync ? "default" : "neutral"}>
                    {app.needsSync ? "Needs sync" : "Synced"}
                  </Badge>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/job-applications/${app.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">
              No job apps with gaps/interview points yet. Generate artifacts on an application
              first.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mastery distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.mastery.length ? (
              analytics.mastery.map((row) => (
                <div key={row.mastery} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{MASTERY_LABELS[row.mastery as InterviewMastery]}</span>
                    <span className="text-[var(--muted)]">{row.count}</span>
                  </div>
                  <Bar max={masteryMax} value={row.count} />
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No questions yet.</p>
            )}
            <p className="text-xs text-[var(--muted)]">
              Answered {analytics.answeredCount} · AI answers{" "}
              {analytics.generatedAnswerCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.weakTopics.length ? (
              analytics.weakTopics.map((topic) => (
                <div key={topic.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{topic.name}</span>
                    <span className="text-[var(--muted)]">{topic.count}</span>
                  </div>
                  <Bar max={weakMax} value={topic.count} />
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No weak topics.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam score trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.examTrend.length ? (
              analytics.examTrend.map((exam) => (
                <Link
                  key={exam.id}
                  className="block space-y-1.5 rounded-[var(--radius-control)] border border-[var(--border)] p-3 hover:border-[var(--accent)]"
                  href={`/admin/interview-prep/exams/${exam.id}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{EXAM_MODE_LABELS[exam.mode]}</span>
                    <Badge variant="neutral">{exam.scorePct}%</Badge>
                  </div>
                  <Bar max={scoreMax} value={exam.scorePct ?? 0} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No completed exams yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.learningByStatus.length ? (
              analytics.learningByStatus.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span>{row.status}</span>
                  <Badge variant="neutral">{row.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Learning queue empty.</p>
            )}
            <Button asChild className="mt-2" size="sm" variant="outline">
              <Link href="/admin/interview-prep/learning">Open learning</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
