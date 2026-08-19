import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
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
        description={`${application.companyName} · ${application.roleTitle} · ${formatDate(application.createdAt)}`}
        title="Job application"
      />

      <div className="mb-4 flex items-center gap-3">
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
        ) : null}
      </div>

      <JobApplicationEditor
        application={application}
        emailSignature={emailSignature}
        systemCv={systemCv}
      />
    </main>
  );
}
