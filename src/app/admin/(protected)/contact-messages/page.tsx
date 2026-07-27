import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MessagesTable } from "@/components/admin/messages-table";
import { formatDate } from "@/lib/utils/date";
import { getAdminMessages } from "@/server/queries/admin-content";

export default async function AdminMessagesPage() {
  const messages = await getAdminMessages();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        description="Filter-ready structured data with read, replied, archived, and deletion workflows."
        title="Contact messages"
      />
      {messages.length ? (
        <MessagesTable
          messages={messages.map((message) => ({
            id: message.id,
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            status: message.status,
            createdAt: formatDate(message.createdAt),
          }))}
        />
      ) : (
        <p className="text-sm text-[var(--muted)]">No contact messages.</p>
      )}
    </main>
  );
}
