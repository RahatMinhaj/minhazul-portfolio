import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChatSessionsTable } from "@/components/admin/chat-sessions-table";
import { getAdminChatSessions } from "@/server/queries/admin-content";

export default async function AdminChatSessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 20;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;

  const { sessions, total } = await getAdminChatSessions({
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
        description="Chat sessions and conversation history."
        title="Chat sessions"
      />

      <form className="mb-6 flex flex-wrap gap-3">
        <input
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          defaultValue={search}
          name="search"
          placeholder="Search conversations..."
        />
        <select
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          defaultValue={status ?? "all"}
          name="status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
        </select>
        <button
          className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
          type="submit"
        >
          Filter
        </button>
      </form>

      {sessions.length ? (
        <ChatSessionsTable
          sessions={sessions.map((s: { id: string; sessionToken: string; messageCount: number; status: string; createdAt: Date; updatedAt: Date; turns: Array<{ content: string; role: string }> }) => ({
            id: s.id,
            sessionToken: s.sessionToken,
            messageCount: s.messageCount,
            status: s.status,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            turns: s.turns,
          }))}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">No chat sessions found.</p>
      )}
    </main>
  );
}
