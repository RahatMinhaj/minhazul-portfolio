import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ScrollReveal } from "@/components/animations/primitives";

export function SectionHeading({
  description,
  eyebrow,
  href,
  linkLabel,
  title,
}: {
  description: string;
  eyebrow: string;
  href: string;
  linkLabel: string;
  title: string;
}) {
  return (
    <ScrollReveal className="mb-10 flex flex-col gap-6 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          {description}
        </p>
      </div>
      <Link
        className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--accent)]"
        data-cursor="Navigate"
        href={href}
      >
        {linkLabel}
        <ArrowRight
          className="transition-transform group-hover:translate-x-1.5"
          aria-hidden
          size={16}
        />
      </Link>
    </ScrollReveal>
  );
}
