"use client";

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteJobApplicationAction } from "@/server/actions/admin-job-applications";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

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
  DRAFT: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  GENERATED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  READY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SENDING: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  SENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
  ARCHIVED: "bg-[var(--surface-raised)] text-[var(--muted)]",
};

const columnHelper = createColumnHelper<ApplicationRow>();

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

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("companyName", {
          header: "Company / Role",
          cell: ({ row }) => (
            <div>
              <Link
                className="text-sm font-medium text-[var(--accent)] hover:underline"
                href={`/admin/job-applications/${row.original.id}`}
              >
                {row.original.companyName}
              </Link>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {row.original.roleTitle}
              </p>
            </div>
          ),
        }),
        columnHelper.accessor("recipientEmail", {
          header: "Recipient",
          cell: (info) => (
            <span className="text-xs text-[var(--muted)]">
              {info.getValue() ?? "—"}
            </span>
          ),
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => (
            <Badge
              className={cn(statusColors[info.getValue()] ?? "")}
              variant="neutral"
            >
              {info.getValue()}
            </Badge>
          ),
        }),
        columnHelper.accessor("updatedAt", {
          header: "Updated",
          cell: (info) => (
            <span className="text-xs text-[var(--muted)]">
              {formatDate(info.getValue())}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/job-applications/${row.original.id}`}>
                  Open
                </Link>
              </Button>
              <AdminMutationForm
                action={deleteJobApplicationAction}
                confirmMessage="Delete this application permanently?"
                submitLabel="Delete"
              >
                <input name="id" type="hidden" value={row.original.id} />
              </AdminMutationForm>
            </div>
          ),
        }),
      ] as ColumnDef<ApplicationRow, unknown>[],
    [],
  );

  return (
    <div className="space-y-4">
      <AdminDataTable
        columns={columns}
        data={applications}
        emptyMessage="No applications found."
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            {total} applications · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild size="sm" variant="ghost">
                <Link href={buildHref({ page: String(page - 1) })}>
                  Previous
                </Link>
              </Button>
            ) : (
              <Button disabled size="sm" variant="ghost">
                Previous
              </Button>
            )}
            {page < totalPages ? (
              <Button asChild size="sm" variant="ghost">
                <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
              </Button>
            ) : (
              <Button disabled size="sm" variant="ghost">
                Next
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">{total} applications</p>
      )}
    </div>
  );
}
