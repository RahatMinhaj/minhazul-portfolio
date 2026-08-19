import type { Metadata } from "next";

import {
  Chronology,
  type ChronologyItem,
} from "@/components/shared/chronology";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { formatMonthYear } from "@/lib/utils/date";
import { getVisibleExperiences } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional roles, responsibilities, and engineering outcomes.",
};

export default async function ExperiencePage() {
  const experiences = await getVisibleExperiences();
  const items: ChronologyItem[] = experiences.map((experience) => ({
    id: experience.id,
    period: experience.startDate
      ? `${formatMonthYear(experience.startDate)} - ${experience.currentlyWorking ? "Present" : experience.endDate ? formatMonthYear(experience.endDate) : ""}`
      : undefined,
    title: experience.position,
    organization: experience.company,
    location: experience.location?.toLowerCase().includes("dhaka")
      ? "Dhaka, Bangladesh"
      : experience.location,
    description: experience.richDescription ? (
      <RichTextDocument document={experience.richDescription} />
    ) : null,
    highlights: experience.achievements,
    technologies: experience.technologies,
    current: experience.currentlyWorking,
  }));

  return (
    <main id="main-content">
      <PageHero
        description="A chronological view of roles, increasing responsibility, representative outcomes, and the technologies used to deliver them."
        eyebrow="Career / Timeline"
        status={`${experiences.length} roles`}
        title="Experience in context."
      />
      <Container className="py-16 sm:py-24">
        {items.length ? <Chronology items={items} /> : <EmptyState />}
      </Container>
    </main>
  );
}
