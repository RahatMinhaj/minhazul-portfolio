import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobApplicationEditor } from "@/components/admin/job-application-editor";
import { getAdminJobApplication } from "@/server/queries/admin-content";
import { getEmailSignature } from "@/features/settings/settings.service";
import { getCvMetadata } from "@/features/cv/cv-storage";
import { formatDate } from "@/lib/utils/date";

export default async function AdminJobApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, emailSignature, systemCv] = await Promise.all([
    getAdminJobApplication(id),
    getEmailSignature(),
    getCvMetadata(),
  ]);
  if (!application) notFound();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/job-applications">
              <ArrowLeft aria-hidden size={15} />
              Back to list
            </Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Job applications", href: "/admin/job-applications" },
          { label: application.companyName },
        ]}
        description={`${application.roleTitle} · Created ${formatDate(application.createdAt)}`}
        title={application.companyName}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Badge variant="neutral">{application.status}</Badge>
          {application.sentAt ? (
            <span className="text-xs text-[var(--muted)]">
              Sent {formatDate(application.sentAt)}
            </span>
          ) : null}
          {application.recipientEmail ? (
            <span className="text-xs text-[var(--muted)]">
              To: {application.recipientEmail}
            </span>
          ) : (
            <span className="text-xs text-[var(--muted)]">No recipient yet</span>
          )}
        </CardContent>
      </Card>

      <JobApplicationEditor
        application={application}
        emailSignature={emailSignature}
        systemCv={systemCv}
      />
    </main>
  );
}
