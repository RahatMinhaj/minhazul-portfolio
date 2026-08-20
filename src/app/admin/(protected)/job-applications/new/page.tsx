import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewJobApplicationForm } from "@/components/admin/job-application-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminNewJobApplicationPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-10 sm:px-8"
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
          { label: "New" },
        ]}
        description="Paste the full job circular. AI extracts company, role, and contact details, then drafts application materials."
        title="New application"
      />
      <Card>
        <CardContent className="p-6">
          <NewJobApplicationForm />
        </CardContent>
      </Card>
    </main>
  );
}
