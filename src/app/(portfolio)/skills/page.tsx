import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import {
  SkillMap,
  type SkillCategoryView,
} from "@/components/skills/skill-map";
import { getVisibleSkillCategories } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Skills",
  description: "A categorized map of technical capabilities.",
};

export default async function SkillsPage() {
  const categories = await getVisibleSkillCategories();
  const view: SkillCategoryView[] = categories.map((category) => ({
    ...category,
    skills: category.skills.map((skill) => ({
      ...skill,
      yearsOfExperience: skill.yearsOfExperience?.toString() ?? null,
    })),
  }));

  return (
    <main id="main-content">
      <PageHero
        description="Capabilities grouped by engineering domain. Proficiency is editorial context, not a scientific measurement."
        eyebrow="Capabilities / Map"
        status={`${categories.reduce((sum, category) => sum + category.skills.length, 0)} skills`}
        title="Technologies connected by practice."
      />
      <Container className="py-16 sm:py-24">
        {categories.length === 0 ? (
          <EmptyState />
        ) : (
          <SkillMap categories={view} />
        )}
      </Container>
    </main>
  );
}
