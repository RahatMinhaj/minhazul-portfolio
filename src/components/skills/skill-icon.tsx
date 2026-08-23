"use client";

import { CenteredLogoImage } from "@/components/shared/centered-logo-image";
import { getSkillIconUrl } from "@/lib/skill-icons";
import { cn } from "@/lib/utils/cn";

export function SkillIcon({
  className,
  name,
  value,
}: {
  className?: string | undefined;
  name: string;
  value?: string | null | undefined;
}) {
  const iconUrl = getSkillIconUrl(value);

  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center overflow-hidden rounded-sm border border-black/10 bg-white p-1 font-mono text-[7px] font-bold text-black/70 shadow-sm",
        className,
      )}
      title={iconUrl ? `${name} logo` : undefined}
    >
      {iconUrl ? (
        <CenteredLogoImage
          alt=""
          onError={(event) => event.currentTarget.remove()}
          src={iconUrl}
        />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </span>
  );
}

function getInitials(name: string) {
  const words = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}
