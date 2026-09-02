import Link from "next/link";
import {
  BookOpenCheck,
  Brain,
  ClipboardList,
  GraduationCap,
  Library,
  Sparkles,
} from "lucide-react";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXAM_MODE_LABELS } from "@/features/interview-prep/interview-prep-types";
import { scanPortfolioGapsAction } from "@/server/actions/admin-interview-prep";
import { getAdminInterviewPrepDashboard } from "@/server/queries/admin-content";

export default async function InterviewPrepDashboardPage() {
  const stats = await getAdminInterviewPrepDashboard();

  const cards = [
    { label: "Questions", value: stats.questionCount, href: "/admin/interview-prep/library", icon: Library },
    { label: "Needs answer", value: stats.unansweredCount, href: "/admin/interview-prep/library?needsAnswer=1", icon: BookOpenCheck },
    { label: "Due review", value: stats.dueCount, href: "/admin/interview-prep/library", icon: ClipboardList },
    { label: "Weak / unknown", value: stats.weakCount, href: "/admin/interview-prep/library?mastery=WEAK", icon: Brain },
    { label: "Open learning", value: stats.openLearning, href: "/admin/interview-prep/learning", icon: GraduationCap },
  ];

  return (
    <main id="main-content" className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8">
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/interview-prep/library">Library</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/interview-prep/analytics">Analytics</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/interview-prep/packs">Packs</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/interview-prep/exams">Start exam</Link>
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep" },
        ]}
        description="Capture questions, generate grounded answers, drill weak areas, and close portfolio gaps."
        title="Interview prep"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full transition-colors hover:border-[var(--accent)]">
              <CardContent className="flex items-center gap-3 p-4">
                <card.icon aria-hidden className="text-[var(--muted)]" size={18} />
                <div>
                  <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                  <p className="text-xs text-[var(--muted)]">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Topics</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/interview-prep/topics">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.topics.length ? (
              stats.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span>{topic.name}</span>
                  <Badge variant="neutral">{topic._count.questions}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No topics yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent exams</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/interview-prep/exams">All exams</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentExams.length ? (
              stats.recentExams.map((exam) => (
                <Link
                  key={exam.id}
                  className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]"
                  href={`/admin/interview-prep/exams/${exam.id}`}
                >
                  <span>
                    {EXAM_MODE_LABELS[exam.mode]} · {exam.questionCount} Q
                  </span>
                  <span className="text-[var(--muted)]">
                    {exam.status === "COMPLETED" && exam.scorePct != null
                      ? `${exam.scorePct}%`
                      : exam.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No exams yet. Run a weak-focus drill.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles aria-hidden size={18} />
              Portfolio gap scan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-[var(--muted)]">
              Suggest learning items from skills with low or missing proficiency. Accept items in
              Learning, then generate notes and practice questions into the library.
            </p>
            <AdminMutationForm action={scanPortfolioGapsAction} submitLabel="Scan portfolio gaps" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
