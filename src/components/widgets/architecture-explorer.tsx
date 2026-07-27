"use client";

import { motion } from "motion/react";
import {
  BrainCircuit,
  Cloud,
  Database,
  Layers3,
  Network,
  Server,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const architectureNodes = [
  { id: "frontend", label: "Frontend", icon: Layers3 },
  { id: "backend", label: "Backend", icon: Server },
  { id: "database", label: "Database", icon: Database },
  { id: "microservices", label: "Messaging", icon: Network },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "ai", label: "AI", icon: BrainCircuit },
] as const;

export function ArchitectureExplorer({
  projects,
  skillCategories,
}: {
  projects: Array<{ title: string; technologies: string[] }>;
  skillCategories: Array<{ name: string; skills: string[] }>;
}) {
  const [active, setActive] = useState<(typeof architectureNodes)[number]>(
    architectureNodes[0],
  );
  const category = skillCategories.find((item) =>
    item.name.toLowerCase().includes(active.id),
  );
  const relatedProjects = projects.filter((project) =>
    project.technologies.some((technology) =>
      technology.toLowerCase().includes(active.id),
    ),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Architecture explorer</CardTitle>
        <CardDescription>
          Select a system layer to inspect verified related skills and projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {architectureNodes.map((node) => {
            const Icon = node.icon;
            return (
              <button
                className="relative flex min-h-28 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-raised)] p-4 text-sm"
                key={node.id}
                onClick={() => setActive(node)}
                type="button"
              >
                {active.id === node.id ? (
                  <motion.span
                    className="absolute inset-0 rounded-[var(--radius-card)] border border-[var(--accent)]"
                    layoutId="active-architecture-node"
                  />
                ) : null}
                <Icon className="text-[var(--accent)]" aria-hidden size={20} />
                {node.label}
              </button>
            );
          })}
        </div>
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--border)] p-5">
          <h3 className="font-semibold">{active.label}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(category?.skills ?? []).map((skill) => (
              <Badge key={skill} variant="neutral">
                {skill}
              </Badge>
            ))}
            {category?.skills.length ? null : (
              <span className="text-sm text-[var(--muted)]">
                Related skills need confirmation.
              </span>
            )}
          </div>
          <p className="mt-5 text-sm text-[var(--muted)]">
            {relatedProjects.length
              ? `Related projects: ${relatedProjects.map((project) => project.title).join(", ")}`
              : "No verified related projects yet."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
