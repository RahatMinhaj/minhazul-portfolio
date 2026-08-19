import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { JobApplicationsTable } from "@/components/admin/job-applications-table";
import { Button } from "@/components/ui/button";
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
        description="Manage job applications, generate AI content, and send emails."
        title="Job applications"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild size="sm">
          <Link href="/admin/job-applications/new">New application</Link>
        </Button>
      </div>

      <form className="mb-6 flex flex-wrap gap-3">
        <input
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          defaultValue={search}
          name="search"
          placeholder="Search applications..."
        />
        <select
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
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
        <button
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
          type="submit"
        >
          Filter
        </button>
      </form>

      {applications.length ? (
        <JobApplicationsTable
          applications={applications.map((a: { id: string; companyName: string; roleTitle: string; recipientEmail: string | null; status: string; createdAt: Date; updatedAt: Date; sentAt: Date | null }) => ({
            id: a.id,
            companyName: a.companyName,
            roleTitle: a.roleTitle,
            recipientEmail: a.recipientEmail,
            status: a.status,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
            sentAt: a.sentAt,
          }))}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No job applications found.
        </p>
      )}
    </main>
  );
}
