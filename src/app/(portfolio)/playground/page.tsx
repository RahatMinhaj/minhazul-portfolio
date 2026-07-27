import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { PlaygroundModules } from "@/components/widgets/playground-modules";
import {
  getPublicProfile,
  getPublicSiteSettings,
  getVisibleProjects,
  getVisibleSkillCategories,
} from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Playground",
  description: "Optional interactive developer experiments.",
};

export default async function PlaygroundPage() {
  const [profile, projects, settings, skillCategories] = await Promise.all([
    getPublicProfile(),
    getVisibleProjects(),
    getPublicSiteSettings(),
    getVisibleSkillCategories(),
  ]);
  if (settings && !settings.playgroundEnabled) notFound();

  return (
    <main id="main-content">
      <PageHero
        description="A deliberately isolated area for safe terminal commands, architecture exploration, and lightweight developer interactions."
        eyebrow="Lab / Playground"
        status="Initializing"
        title="Experiments live here."
      />
      <Container className="py-16 sm:py-24">
        <PlaygroundModules
          availability={
            profile?.availabilityStatus ?? "Availability needs confirmation."
          }
          profileName={profile?.fullName ?? "Needs confirmation"}
          projects={projects.map((project) => ({
            title: project.title,
            technologies: project.technologies,
          }))}
          skillCategories={skillCategories.map((category) => ({
            name: category.name,
            skills: category.skills.map((skill) => skill.name),
          }))}
        />
      </Container>
    </main>
  );
}
