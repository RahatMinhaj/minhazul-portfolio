"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function InteractiveLinkCard({
  children,
  className,
  cursorLabel = "Open",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  cursorLabel?: string;
  href: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("h-full", className)}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reduceMotion
          ? {}
          : {
              y: -8,
              scale: 1.012,
            }
      }
      whileTap={reduceMotion ? {} : { scale: 0.985 }}
    >
      <Link
        className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-glow)]"
        data-cursor={cursorLabel}
        href={href}
      >
        <motion.span
          aria-hidden
          className="absolute -top-24 -right-24 size-48 rounded-full bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] blur-3xl"
          whileHover={{ scale: 1.4 }}
        />
        <ArrowUpRight
          className="absolute top-5 right-5 text-[var(--muted)] transition-[color,transform] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--accent)]"
          aria-hidden
          size={17}
        />
        {children}
      </Link>
    </motion.div>
  );
}
