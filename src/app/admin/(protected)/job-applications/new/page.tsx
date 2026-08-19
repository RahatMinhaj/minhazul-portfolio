import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewJobApplicationForm } from "@/components/admin/job-application-form";

export default function AdminNewJobApplicationPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-10 sm:px-8"
    >
      <AdminPageHeader
        description="Create a new job application draft."
        title="New application"
      />
      <NewJobApplicationForm />
    </main>
  );
}
