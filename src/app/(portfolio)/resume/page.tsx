import type { Metadata } from "next";
import { Download, Eye } from "lucide-react";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { getCvMetadata } from "@/features/cv/cv-storage";

export const metadata: Metadata = {
  title: "Resume",
  description: "Preview or download the professional resume.",
};

export default async function ResumePage() {
  const resume = await getCvMetadata();

  return (
    <main id="main-content">
      <PageHero
        description="A concise overview of experience, selected systems, technical capabilities, and education."
        eyebrow="Document / Resume"
        status={resume ? "Available" : "Currently unavailable"}
        title="A focused career snapshot."
      />
      <Container className="py-16 sm:py-24">
        {resume ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Eye aria-hidden size={17} /> Preview resume
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Review the document before downloading. Downloads are limited
                  to prevent automated abuse.
                </p>
              </div>
              <Button asChild size="lg">
                <a href="/api/resume?download=1">
                  <Download aria-hidden size={17} />
                  Download resume
                </a>
              </Button>
            </div>
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
              <iframe
                className="h-[72vh] min-h-[34rem] w-full"
                src="/api/resume#view=FitH"
                title="Resume preview"
              />
            </div>
          </div>
        ) : (
          <EmptyState
            description="The downloadable document is being updated. The experience and project pages contain the current details."
            title="Resume not available yet."
          />
        )}
      </Container>
    </main>
  );
}
