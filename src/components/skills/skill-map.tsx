"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { SkillIcon } from "@/components/skills/skill-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export type SkillCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  skills: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    proficiency: number | null;
    yearsOfExperience: string | null;
    highlighted: boolean;
  }>;
};

export function SkillMap({ categories }: { categories: SkillCategoryView[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleCategories = useMemo(
    () =>
      activeCategory === "all"
        ? categories
        : categories.filter((category) => category.slug === activeCategory),
    [activeCategory, categories],
  );

  return (
    <>
      <div
        aria-label="Skill categories"
        className="mb-8 flex flex-wrap gap-2"
        role="group"
      >
        <button
          className={filterClass(activeCategory === "all")}
          onClick={() => setActiveCategory("all")}
          type="button"
        >
          All
        </button>
        {categories.map((category) => (
          <button
            className={filterClass(activeCategory === category.slug)}
            key={category.id}
            onClick={() => setActiveCategory(category.slug)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {visibleCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              {category.description ? (
                <CardDescription>{category.description}</CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm",
                    skill.highlighted
                      ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                      : "border-[var(--border)] bg-[var(--surface-raised)]",
                  )}
                  key={skill.id}
                  title={
                    skill.yearsOfExperience
                      ? `${skill.yearsOfExperience} years of editorially recorded experience`
                      : "Experience duration needs confirmation"
                  }
                >
                  <SkillIcon name={skill.name} value={skill.icon} />
                  {skill.name}
                  {skill.highlighted ? <Badge>Core</Badge> : null}
                </span>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function filterClass(active: boolean) {
  return cn(
    "rounded-full border px-4 py-2 text-sm transition-colors",
    active
      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]",
  );
}
