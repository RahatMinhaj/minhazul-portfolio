import type { Metadata } from "next";
import { Download } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { getPublicProfile } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Download the verified professional résumé.",
};

export default async function ResumePage() {
  const profile = await getPublicProfile();

  return (
    <main id="main-content">
      <PageHero
        description="The downloadable résumé is published only after its source document has been provided and verified."
        eyebrow="Document / Résumé"
        status={profile?.resumeUrl ? "Available" : "Needs confirmation"}
        title="A verified career snapshot."
      />
      <Container className="py-16 sm:py-24">
        {profile?.resumeUrl ? (
          <Button asChild size="lg">
            <a href={profile.resumeUrl} rel="noreferrer" target="_blank">
              <Download aria-hidden size={17} />
              Download résumé
            </a>
          </Button>
        ) : (
          <EmptyState
            description="No résumé URL is configured. A temporary or fabricated document will not be generated."
            title="Résumé not available yet."
          />
        )}
      </Container>
    </main>
  );
}
