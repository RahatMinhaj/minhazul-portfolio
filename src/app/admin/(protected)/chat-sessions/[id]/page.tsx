import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { getAdminChatSession } from "@/server/queries/admin-content";
import { formatDate } from "@/lib/utils/date";

export default async function AdminChatSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAdminChatSession(id);
  if (!session) notFound();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Chat sessions", href: "/admin/chat-sessions" },
          { label: "Session" },
        ]}
        description={`Session created ${formatDate(session.createdAt)} · ${session.messageCount} messages`}
        title="Chat session detail"
      />

      <div className="space-y-4">
        {session.turns.map((turn) => (
          <div
            className={`rounded-[var(--radius-card)] border p-5 ${
              turn.role === "user"
                ? "border-[var(--border)] bg-[var(--surface)]"
                : "border-[var(--accent)]/20 bg-[var(--surface-raised)]"
            }`}
            key={turn.id}
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={turn.role === "user" ? "default" : "neutral"}>
                {turn.role}
              </Badge>
              <span className="text-xs text-[var(--muted)]">
                {formatDate(turn.createdAt)}
              </span>
              {turn.provider ? (
                <span className="text-xs text-[var(--muted)]">
                  · {turn.provider}
                </span>
              ) : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7">
              {turn.content}
            </p>
            {turn.sources ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-[var(--accent)]">
                  Sources
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-[var(--muted)]">
                  {JSON.stringify(turn.sources, null, 2)}
                </pre>
              </details>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
