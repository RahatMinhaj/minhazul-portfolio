import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { getVisibleCertifications } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Certifications",
  description: "Professional certifications and credentials.",
};

export default async function CertificationsPage() {
  const certifications = await getVisibleCertifications();

  return (
    <main id="main-content">
      <PageHero
        description="Focused professional learning across software development, Java, and the Spring ecosystem."
        eyebrow="Credentials / Verification"
        status={`${certifications.length} records`}
        title="Evidence of continued learning."
      />
      <Container className="py-16 sm:py-24">
        {certifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {certifications.map((certification) => (
              <Card className="flex flex-col" key={certification.id}>
                <CardHeader>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {certification.featured ? <Badge>Featured</Badge> : null}
                    {certification.category ? (
                      <Badge variant="neutral">{certification.category}</Badge>
                    ) : null}
                  </div>
                  <CardTitle>{certification.name}</CardTitle>
                  <CardDescription>
                    {certification.issuer}
                    {certification.issueDate
                      ? ` · ${formatDate(certification.issueDate)}`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  {certification.credentialId ? (
                    <p className="mb-4 font-mono text-xs text-[var(--muted)]">
                      ID: {certification.credentialId}
                    </p>
                  ) : null}
                  {certification.credentialUrl ? (
                    <a
                      className="inline-flex items-center gap-2 text-sm text-[var(--accent)]"
                      href={certification.credentialUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Verify credential
                      <ExternalLink aria-hidden size={14} />
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
