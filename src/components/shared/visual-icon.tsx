import { createElement } from "react";

import { SkillIcon } from "@/components/skills/skill-icon";
import { getLucideIcon } from "@/lib/lucide-icon-options";

export function VisualIcon({
  className,
  fallback,
  name,
  value,
}: {
  className?: string;
  fallback?: string;
  name: string;
  value?: string | null;
}) {
  const Icon = getLucideIcon(value ?? fallback);
  if (Icon) {
    return createElement(Icon, {
      "aria-hidden": true,
      className,
      size: 16,
    });
  }

  return <SkillIcon className={className} name={name} value={value} />;
}
