import { Building2, HeartPulse, Landmark, Network } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const visuals = [
  { Icon: HeartPulse, label: "Healthcare systems" },
  { Icon: Landmark, label: "Public-sector platforms" },
  { Icon: Building2, label: "Enterprise operations" },
] as const;

export function ProjectVisual({
  className,
  index = 0,
  projectType,
}: {
  className?: string;
  index?: number;
  projectType?: string | null;
}) {
  const normalizedType = projectType?.toLowerCase() ?? "";
  const visual = normalizedType.includes("hospital")
    ? visuals[0]
    : normalizedType.includes("government") ||
        normalizedType.includes("procurement")
      ? visuals[1]
      : (visuals[index % visuals.length] ?? visuals[2]);
  const Icon = visual.Icon;

  return (
    <div
      aria-label={projectType ?? visual.label}
      className={cn(
        "project-visual relative isolate min-h-52 overflow-hidden border-b border-[var(--border)] bg-[var(--surface-raised)]",
        className,
      )}
      role="img"
    >
      <div className="project-visual-grid absolute inset-0" aria-hidden />
      <div className="project-visual-orbit absolute" aria-hidden />
      <span className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] uppercase">
        System / {String(index + 1).padStart(2, "0")}
      </span>
      <span className="absolute right-5 bottom-5 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 py-1.5 font-mono text-[10px] text-[var(--muted)]">
        {projectType ?? visual.label}
      </span>
      <div className="absolute inset-0 grid place-items-center" aria-hidden>
        <span className="grid size-20 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-glow)]">
          <Icon size={31} strokeWidth={1.4} />
        </span>
      </div>
      <Network
        className="absolute top-[22%] right-[17%] text-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        aria-hidden
        size={18}
      />
    </div>
  );
}
