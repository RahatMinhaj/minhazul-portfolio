import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Container } from "@/components/shared/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicProfile } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "About",
  description: "Professional story, engineering focus, and working principles.",
};

export default async function AboutPage() {
  const profile = await getPublicProfile();

  return (
    <main id="main-content">
      <PageHero
        description="The professional story, present focus, engineering values, and learning direction—sourced from verified profile data."
        eyebrow="Profile / About"
        status={profile ? "Verified data" : "Needs confirmation"}
        title={profile?.fullName ?? "The person behind the systems."}
      />
      <Container className="py-16 sm:py-24">
        {!profile ? (
          <EmptyState />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
            <article>
              <p className="text-xl leading-9 text-[var(--muted)]">
                {profile.shortBio}
              </p>
              <div className="mt-10">
                <RichTextDocument document={profile.longBio} />
              </div>
            </article>
            <aside className="space-y-4">
              {[
                ["Current focus", profile.currentFocus],
                ["Current role", profile.currentRole],
                ["Company", profile.currentCompany],
                ["Location", profile.location],
                ["Availability", profile.availabilityStatus],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardHeader>
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-base">
                      {value ?? "Needs confirmation"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}
