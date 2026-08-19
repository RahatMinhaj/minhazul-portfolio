"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-raised)]">
            <tr>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Turns</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="px-4 py-4">
                  <Link
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                    href={`/admin/chat-sessions/${session.id}`}
                  >
                    {session.turns[0]?.content?.slice(0, 100) ?? "No messages"}
                    {(session.turns[0]?.content?.length ?? 0) > 100 ? "..." : ""}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="neutral">{session.messageCount}</Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="neutral">{session.status}</Badge>
                </td>
                <td className="px-4 py-4 text-xs text-[var(--muted)]">
                  {formatDate(session.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <AdminMutationForm
                    action={deleteChatSessionAction}
                    confirmMessage="Delete this chat session permanently?"
                    submitLabel="delete"
                  >
                    <input name="id" type="hidden" value={session.id} />
                  </AdminMutationForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {total} sessions · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="ghost" disabled={page <= 1}>
              <Link href={buildHref({ page: String(page - 1) })}>Previous</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" disabled={page >= totalPages}>
              <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
