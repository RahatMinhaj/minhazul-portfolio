"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteJobApplicationAction2 } from "@/server/actions/admin-job-applications";
import { formatDate } from "@/lib/utils/date";

type ApplicationRow = {
  id: string;
  companyName: string;
  roleTitle: string;
  recipientEmail: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt: Date | null;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-500/10 text-yellow-500",
  GENERATED: "bg-blue-500/10 text-blue-500",
  READY: "bg-green-500/10 text-green-500",
  SENDING: "bg-orange-500/10 text-orange-500",
  SENT: "bg-green-500/10 text-green-500",
  FAILED: "bg-red-500/10 text-red-500",
  ARCHIVED: "bg-gray-500/10 text-gray-500",
};

export function JobApplicationsTable({
  applications,
  total,
  page,
  pageSize,
}: {
  applications: ApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    return `${pathname}?${sp.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-raised)]">
            <tr>
              <th className="px-4 py-3 font-medium">Company / Role</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-4 py-4">
                  <Link
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                    href={`/admin/job-applications/${app.id}`}
                  >
                    {app.companyName}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {app.roleTitle}
                  </p>
                </td>
                <td className="px-4 py-4 text-xs text-[var(--muted)]">
                  {app.recipientEmail ?? "—"}
                </td>
                <td className="px-4 py-4">
                  <Badge
                    className={statusColors[app.status] ?? ""}
                    variant="neutral"
                  >
                    {app.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-xs text-[var(--muted)]">
                  {formatDate(app.updatedAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/job-applications/${app.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <AdminMutationForm
                      action={deleteJobApplicationAction2}
                      confirmMessage="Delete this application permanently?"
                      submitLabel="delete"
                    >
                      <input name="id" type="hidden" value={app.id} />
                    </AdminMutationForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {total} applications · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="ghost" disabled={page <= 1}>
              <Link href={buildHref({ page: String(page - 1) })}>
                Previous
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
            >
              <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
