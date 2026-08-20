import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { JobApplicationsTable } from "@/components/admin/job-applications-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminJobApplications } from "@/server/queries/admin-content";

export default async function AdminJobApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 20;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;

  const { applications, total } = await getAdminJobApplications({
    search,
    status,
    page,
    pageSize,
  });

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        actions={
          <Button asChild size="sm">
            <Link href="/admin/job-applications/new">
              <Plus aria-hidden size={15} />
              New application
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Job applications" },
        ]}
        description="Generate tailored materials from a job circular, refine each artifact, and send the final email."
        title="Job applications"
      />

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5">
          <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="min-w-[14rem] flex-1 space-y-1.5 text-sm">
              <span className="font-medium text-[var(--foreground)]">Search</span>
              <span className="relative block">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] py-2 pr-3 pl-9 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                  defaultValue={search}
                  name="search"
                  placeholder="Company, role, or email"
                />
              </span>
            </label>
            <label className="space-y-1.5 text-sm sm:w-48">
              <span className="font-medium text-[var(--foreground)]">Status</span>
              <select
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                defaultValue={status ?? "all"}
                name="status"
              >
                <option value="all">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated</option>
                <option value="READY">Ready</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <Button size="sm" type="submit" variant="outline">
              Apply filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {applications.length ? (
        <JobApplicationsTable
          applications={applications.map(
            (a: {
              id: string;
              companyName: string;
              roleTitle: string;
              recipientEmail: string | null;
              status: string;
              createdAt: Date;
              updatedAt: Date;
              sentAt: Date | null;
            }) => ({
              id: a.id,
              companyName: a.companyName,
              roleTitle: a.roleTitle,
              recipientEmail: a.recipientEmail,
              status: a.status,
              createdAt: a.createdAt,
              updatedAt: a.updatedAt,
              sentAt: a.sentAt,
            }),
          )}
          page={page}
          pageSize={pageSize}
          total={total}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-8">
            <div>
              <p className="text-base font-medium">No applications yet</p>
              <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
                Paste a job circular to extract metadata and generate subject,
                cover letter, email body, and interview notes.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/job-applications/new">
                <Plus aria-hidden size={15} />
                Create first application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
