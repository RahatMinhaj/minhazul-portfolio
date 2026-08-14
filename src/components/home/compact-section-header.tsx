import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ScrollReveal } from "@/components/animations/primitives";

export function CompactSectionHeader({
  eyebrow,
  href,
  linkLabel,
}: {
  eyebrow: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <ScrollReveal className="mb-7 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
      <p className="eyebrow">{eyebrow}</p>
      <Link
        className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--accent)]"
        href={href}
      >
        {linkLabel}
        <ArrowRight
          className="transition-transform group-hover:translate-x-1"
          aria-hidden
          size={15}
        />
      </Link>
    </ScrollReveal>
  );
}
