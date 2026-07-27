import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMonthYear } from "@/lib/utils/date";
import { getVisibleExperiences } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Experience",
  description: "Verified professional roles, responsibilities, and outcomes.",
};

export default async function ExperiencePage() {
  const experiences = await getVisibleExperiences();

  return (
    <main id="main-content">
      <PageHero
        description="A chronological view of verified roles, responsibilities, achievements, and the technologies used to deliver them."
        eyebrow="Career / Timeline"
        status={`${experiences.length} entries`}
        title="Experience in context."
      />
      <Container className="py-16 sm:py-24">
        {experiences.length === 0 ? (
          <EmptyState />
        ) : (
          <ol className="relative space-y-6 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-px before:bg-[var(--border-strong)]">
            {experiences.map((experience) => (
              <li className="relative pl-10" key={experience.id}>
                <span className="absolute top-6 left-[0.4rem] size-3 rounded-full border-2 border-[var(--background)] bg-[var(--accent)] shadow-[var(--shadow-glow)]" />
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      {experience.currentlyWorking ? (
                        <Badge>Current</Badge>
                      ) : null}
                      <Badge variant="neutral">
                        {formatMonthYear(experience.startDate)} —{" "}
                        {experience.currentlyWorking
                          ? "Present"
                          : formatMonthYear(experience.endDate)}
                      </Badge>
                    </div>
                    <CardTitle className="pt-4 text-2xl">
                      {experience.position}
                    </CardTitle>
                    <CardDescription>
                      {experience.company}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </CardDescription>
                    {experience.summary ? (
                      <p className="pt-5 leading-7 text-[var(--muted)]">
                        {experience.summary}
                      </p>
                    ) : null}
                    {experience.achievements.length ? (
                      <ul className="list-disc space-y-2 pt-5 pl-5 text-sm leading-6 text-[var(--muted)]">
                        {experience.achievements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-5">
                      {experience.technologies.map((item) => (
                        <Badge key={item} variant="neutral">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </main>
  );
}
