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
import { deleteChatSessionAction } from "@/server/actions/admin-chat";
import { formatDate } from "@/lib/utils/date";

type SessionRow = {
  id: string;
  sessionToken: string;
  messageCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  turns: Array<{ content: string; role: string }>;
};

const columnHelper = createColumnHelper<SessionRow>();

export function ChatSessionsTable({
  sessions,
  total,
  page,
  pageSize,
}: {
  sessions: SessionRow[];
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
        columnHelper.display({
          id: "preview",
          header: "Preview",
          cell: ({ row }) => {
            const preview = row.original.turns[0]?.content ?? "No messages";
            const truncated =
              preview.length > 100 ? `${preview.slice(0, 100)}...` : preview;
            return (
              <Link
                className="text-sm font-medium text-[var(--accent)] hover:underline"
                href={`/admin/chat-sessions/${row.original.id}`}
              >
                {truncated}
              </Link>
            );
          },
        }),
        columnHelper.accessor("messageCount", {
          header: "Turns",
          cell: (info) => <Badge variant="neutral">{info.getValue()}</Badge>,
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => <Badge variant="neutral">{info.getValue()}</Badge>,
        }),
        columnHelper.accessor("createdAt", {
          header: "Created",
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
            <AdminMutationForm
              action={deleteChatSessionAction}
              confirmMessage="Delete this chat session permanently?"
              submitLabel="delete"
            >
              <input name="id" type="hidden" value={row.original.id} />
            </AdminMutationForm>
          ),
        }),
      ] as ColumnDef<SessionRow, unknown>[],
    [],
  );

  return (
    <div className="space-y-4">
      <AdminDataTable
        columns={columns}
        data={sessions}
        emptyMessage="No chat sessions found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {total} sessions · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild disabled={page <= 1} size="sm" variant="ghost">
              <Link href={buildHref({ page: String(page - 1) })}>Previous</Link>
            </Button>
            <Button
              asChild
              disabled={page >= totalPages}
              size="sm"
              variant="ghost"
            >
              <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
