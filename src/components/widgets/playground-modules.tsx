"use client";

import dynamic from "next/dynamic";

const InteractiveTerminal = dynamic(
  () =>
    import("@/components/widgets/interactive-terminal").then(
      (module) => module.InteractiveTerminal,
    ),
  { loading: () => <WidgetLoading label="terminal" />, ssr: false },
);
const ArchitectureExplorer = dynamic(
  () =>
    import("@/components/widgets/architecture-explorer").then(
      (module) => module.ArchitectureExplorer,
    ),
  { loading: () => <WidgetLoading label="architecture explorer" /> },
);
const TypingChallenge = dynamic(
  () =>
    import("@/components/widgets/typing-challenge").then(
      (module) => module.TypingChallenge,
    ),
  { loading: () => <WidgetLoading label="typing challenge" />, ssr: false },
);

export function PlaygroundModules({
  availability,
  profileName,
  projects,
  skillCategories,
}: {
  availability: string;
  profileName: string;
  projects: Array<{ title: string; technologies: string[] }>;
  skillCategories: Array<{ name: string; skills: string[] }>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <InteractiveTerminal
        availability={availability}
        profileName={profileName}
      />
      <TypingChallenge />
      <div className="lg:col-span-2">
        <ArchitectureExplorer
          projects={projects}
          skillCategories={skillCategories}
        />
      </div>
    </div>
  );
}

function WidgetLoading({ label }: { label: string }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
      Loading {label}…
    </div>
  );
}
