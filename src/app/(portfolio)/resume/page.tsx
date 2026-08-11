import type { Metadata } from "next";
import { Download } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  getPublicProfile,
  getPublicSiteSettings,
} from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Download the professional résumé.",
};

export default async function ResumePage() {
  const [profile, settings] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);
  const resumeUrl = profile?.resumeUrl ?? settings?.resumeUrl ?? null;

  return (
    <main id="main-content">
      <PageHero
        description="A concise overview of experience, selected systems, technical capabilities, and education."
        eyebrow="Document / Résumé"
        status={resumeUrl ? "Available" : "Currently unavailable"}
        title="A focused career snapshot."
      />
      <Container className="py-16 sm:py-24">
        {resumeUrl ? (
          <Button asChild size="lg">
            <a href={resumeUrl} rel="noreferrer" target="_blank">
              <Download aria-hidden size={17} />
              Download résumé
            </a>
          </Button>
        ) : (
          <EmptyState
            description="The downloadable document is being updated. The experience and project pages contain the current details."
            title="Résumé not available yet."
          />
        )}
      </Container>
    </main>
  );
}
