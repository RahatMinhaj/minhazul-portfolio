import Link from "next/link";

import {
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InterviewPrepRedirectForm } from "@/components/admin/interview-prep-redirect-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  importJobApplicationAction,
  savePackAction,
} from "@/server/actions/admin-interview-prep";
import {
  getAdminInterviewPacks,
  getAdminJobApplications,
} from "@/server/queries/admin-content";

const selectClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-sm";

export default async function InterviewPrepPacksPage() {
  const [packs, { applications }] = await Promise.all([
    getAdminInterviewPacks(),
    getAdminJobApplications({
      search: undefined,
      status: undefined,
      page: 1,
      pageSize: 50,
    }),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Interview prep", href: "/admin/interview-prep" },
          { label: "Packs" },
        ]}
        description="Company/role packs for focused prep. Import interview points and gaps from job applications."
        title="Interview packs"
      />

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create pack</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMutationForm
                action={savePackAction}
                className="grid gap-4"
                submitLabel="Create pack"
              >
                <AdminField label="Title" name="title" required />
                <AdminField label="Company" name="companyName" />
                <AdminField label="Role" name="roleTitle" />
                <AdminField label="Target date" name="targetDate" type="date" />
                <AdminTextarea label="Notes" name="notes" rows={3} />
              </AdminMutationForm>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import from job application</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length ? (
                <InterviewPrepRedirectForm
                  action={importJobApplicationAction}
                  className="grid gap-4"
                  redirectToPrefix="/admin/interview-prep/packs"
                  submitLabel="Import points & gaps"
                >
                  <label className="space-y-2 text-sm">
                    <span className="font-medium">Application</span>
                    <select className={selectClass} name="applicationId" required>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.companyName} · {app.roleTitle}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs text-[var(--muted)]">
                    Pulls `interviewPoints` into the pack as questions and `gaps` into the learning
                    queue.
                  </p>
                </InterviewPrepRedirectForm>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  No job applications yet.{" "}
                  <Link className="underline" href="/admin/job-applications/new">
                    Create one
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {packs.length ? (
            packs.map((pack) => (
              <Link
                key={pack.id}
                className="block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]"
                href={`/admin/interview-prep/packs/${pack.id}`}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="neutral">{pack._count.items} Q</Badge>
                  <Badge variant="neutral">{pack._count.exams} exams</Badge>
                  {pack.targetDate ? (
                    <Badge variant="default">
                      Target {pack.targetDate.toISOString().slice(0, 10)}
                    </Badge>
                  ) : null}
                </div>
                <p className="font-medium">{pack.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {[pack.companyName, pack.roleTitle].filter(Boolean).join(" · ") || "No company/role"}
                </p>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-sm text-[var(--muted)]">
                No packs yet. Create one or import from a job application.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
