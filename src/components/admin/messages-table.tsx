"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { Badge } from "@/components/ui/badge";
import { updateMessageAction } from "@/server/actions/admin-settings";

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
};

const columnHelper = createColumnHelper<MessageRow>();

export function MessagesTable({ messages }: { messages: MessageRow[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("subject", {
        header: "Message",
        cell: ({ row }) => (
          <div className="min-w-64">
            <p className="font-medium">{row.original.subject}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {row.original.name} · {row.original.email}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-[var(--accent)]">
                Read content
              </summary>
              <p className="mt-2 max-w-xl text-sm leading-6 whitespace-pre-wrap text-[var(--muted)]">
                {row.original.message}
              </p>
            </details>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <Badge variant="neutral">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("createdAt", {
        header: "Received",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex min-w-64 flex-wrap gap-2">
            {(["READ", "REPLIED", "ARCHIVED"] as const).map((intent) => (
              <AdminMutationForm
                action={updateMessageAction}
                key={intent}
                submitLabel={intent.toLowerCase()}
              >
                <input name="id" type="hidden" value={row.original.id} />
                <input name="intent" type="hidden" value={intent} />
              </AdminMutationForm>
            ))}
            <AdminMutationForm
              action={updateMessageAction}
              confirmMessage="Permanently delete this message?"
              submitLabel="delete"
            >
              <input name="id" type="hidden" value={row.original.id} />
              <input name="intent" type="hidden" value="DELETE" />
            </AdminMutationForm>
          </div>
        ),
      }),
    ],
    [],
  );
  // TanStack Table intentionally exposes non-memoizable functions; keep this
  // component outside React Compiler optimization until the library supports it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: messages,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-raised)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="px-4 py-3 font-medium" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="px-4 py-4 align-top" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
