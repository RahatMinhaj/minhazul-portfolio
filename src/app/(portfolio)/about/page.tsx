import type { Metadata } from "next";
import { CheckCircle2, Compass, UserRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
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
        description="The professional story, present focus, engineering values, and learning direction behind the systems."
        eyebrow="Profile / About"
        title={profile?.fullName ?? "The person behind the systems."}
        {...(profile?.professionalTitle
          ? { status: profile.professionalTitle }
          : {})}
      />
      <Container className="py-16 sm:py-24">
        {!profile ? (
          <EmptyState />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <article>
              <UserRound
                className="text-[var(--accent)]"
                aria-hidden
                size={26}
              />
              <p className="text-xl leading-9 text-[var(--muted)]">
                {profile.shortBio}
              </p>
              <div className="mt-10">
                <RichTextDocument document={profile.longBio} />
              </div>
              {profile.engineeringValues.length ? (
                <section className="mt-14 border-t border-[var(--border)] pt-10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className="text-[var(--accent)]"
                      aria-hidden
                      size={20}
                    />
                    <h2 className="text-2xl font-semibold">
                      Engineering values
                    </h2>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {profile.engineeringValues.map((value) => (
                      <Badge key={value} variant="neutral">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </section>
              ) : null}
              {profile.learningGoals.length ? (
                <section className="mt-10">
                  <div className="flex items-center gap-3">
                    <Compass
                      className="text-[var(--accent)]"
                      aria-hidden
                      size={20}
                    />
                    <h2 className="text-2xl font-semibold">
                      Learning direction
                    </h2>
                  </div>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {profile.learningGoals.map((goal) => (
                      <li
                        className="border-l border-[var(--border-strong)] pl-4 text-sm leading-6 text-[var(--muted)]"
                        key={goal}
                      >
                        {goal}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </article>
            <aside className="space-y-4">
              {[
                ["Current focus", profile.currentFocus],
                ["Current role", profile.currentRole],
                ["Company", profile.currentCompany],
                ["Location", profile.location],
                ["Availability", profile.availabilityStatus],
              ]
                .filter((item): item is [string, string] => Boolean(item[1]))
                .map(([label, value]) => (
                  <Card key={label}>
                    <CardHeader>
                      <CardDescription>{label}</CardDescription>
                      <p className="text-base font-semibold">{value}</p>
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
