import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VisitorChart } from "@/components/admin/visitor-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { getAdminDashboard } from "@/server/queries/admin-dashboard";

export default async function AdminDashboardPage() {
  const { metrics, recentMessages, visitorSeries } = await getAdminDashboard();
  const metricEntries = [
    ["Projects", metrics.projects],
    ["Public projects", metrics.publishedProjects],
    ["Skills", metrics.skills],
    ["Experience entries", metrics.experiences],
    ["Certifications", metrics.certifications],
    ["Blog drafts", metrics.drafts],
    ["Published articles", metrics.publishedPosts],
    ["Unread messages", metrics.unreadMessages],
    ["Visitor events", metrics.visitorEvents],
  ] as const;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[96rem] px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        description="Live database totals and recent content activity."
        title="Dashboard"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricEntries.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-4xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Visitor events · last 7 days
        </h2>
        <Card className="p-5">
          <VisitorChart data={visitorSeries} />
        </Card>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Recent messages</h2>
        {recentMessages.length ? (
          <Card>
            <div className="divide-y divide-[var(--border)]">
              {recentMessages.map((message) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-5"
                  key={message.id}
                >
                  <div>
                    <p className="font-medium">{message.subject}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {message.name} · {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <Badge variant="neutral">{message.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <p className="text-sm text-[var(--muted)]">No messages yet.</p>
        )}
      </section>
    </main>
  );
}
