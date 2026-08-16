import { FileText } from "lucide-react";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCvMetadata, MAX_CV_SIZE_BYTES } from "@/features/cv/cv-storage";
import { deleteCvAction, uploadCvAction } from "@/server/actions/admin-cv";

export default async function AdminCvPage() {
  const cv = await getCvMetadata();

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Upload and manage the single PDF CV stored on this server. A new upload automatically replaces the current file."
        title="CV"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>{cv ? "Replace CV" : "Upload CV"}</CardTitle>
            <CardDescription>
              PDF only, up to {MAX_CV_SIZE_BYTES / 1024 / 1024} MB. The file is
              stored outside the public directory and served through a protected
              endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminMutationForm
              action={uploadCvAction}
              className="space-y-5"
              submitLabel={cv ? "Replace CV" : "Upload CV"}
            >
              <label className="block space-y-2 text-sm">
                <span className="font-medium">CV PDF</span>
                <input
                  accept="application/pdf,.pdf"
                  className="block w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[var(--surface-raised)] file:px-3 file:py-2 file:text-[var(--foreground)]"
                  name="cv"
                  required
                  type="file"
                />
              </label>
            </AdminMutationForm>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current file</CardTitle>
          </CardHeader>
          <CardContent>
            {cv ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <FileText
                    className="mt-0.5 text-[var(--accent)]"
                    aria-hidden
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-medium">CV is available</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {(cv.sizeBytes / 1024 / 1024).toFixed(2)} MB · Updated{" "}
                      {cv.updatedAt.toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>
                <a
                  className="text-sm font-medium text-[var(--accent)] hover:underline"
                  href="/resume"
                  target="_blank"
                >
                  Open public resume page
                </a>
                <AdminMutationForm
                  action={deleteCvAction}
                  confirmMessage="Delete the current CV? It will no longer be available publicly."
                  submitLabel="Delete CV"
                >
                  <input name="intent" type="hidden" value="delete" />
                </AdminMutationForm>
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                No CV has been uploaded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
