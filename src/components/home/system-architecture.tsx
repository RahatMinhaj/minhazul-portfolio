import {
  ArrowDown,
  Blocks,
  Database,
  Globe2,
  Network,
  ServerCog,
  ShieldCheck,
} from "lucide-react";

import { ScrollReveal } from "@/components/animations/primitives";
import { Badge } from "@/components/ui/badge";

const layers = [
  {
    title: "Interface",
    detail:
      "Next.js App Router, React Server Components, focused client islands",
    icon: Globe2,
  },
  {
    title: "Delivery",
    detail: "Pages, route handlers, authenticated Server Actions",
    icon: Network,
  },
  {
    title: "Application",
    detail: "Feature services own use cases and business rules",
    icon: Blocks,
  },
  {
    title: "Persistence",
    detail: "Read models and feature repositories isolate Prisma access",
    icon: ServerCog,
  },
  {
    title: "Data",
    detail: "Prisma 7, PostgreSQL adapter, PostgreSQL",
    icon: Database,
  },
] as const;

export function SystemArchitecture() {
  return (
    <ScrollReveal className="architecture-board relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
      <div className="architecture-board-grid absolute inset-0" aria-hidden />
      <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] xl:items-center">
        <ol className="grid gap-2 sm:grid-cols-5 sm:gap-3">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <li className="relative flex sm:flex-col" key={layer.title}>
                <div className="group relative z-10 flex min-h-32 w-full items-start gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-4 transition-colors hover:border-[var(--accent)] sm:min-h-44 sm:flex-col sm:justify-between">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)]">
                    <Icon aria-hidden size={17} />
                  </span>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--muted)] uppercase">
                      Layer {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 font-semibold">{layer.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      {layer.detail}
                    </p>
                  </div>
                </div>
                {index < layers.length - 1 ? (
                  <ArrowDown
                    className="mx-2 self-center text-[var(--accent)] sm:absolute sm:top-1/2 sm:-right-3.5 sm:z-20 sm:-translate-y-1/2 sm:-rotate-90 sm:bg-[var(--surface)]"
                    aria-hidden
                    size={16}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="relative border-t border-[var(--border)] pt-8 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-10">
          <ShieldCheck className="text-[var(--accent)]" aria-hidden size={28} />
          <p className="eyebrow mt-6">Two deliberate paths</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Fast reads. Guarded writes.
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Public pages use a CQRS-style read model. Administrative changes
            pass through authorization, validation, feature services,
            repositories, and path revalidation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Server-first</Badge>
            <Badge variant="neutral">Typed boundaries</Badge>
            <Badge variant="neutral">PostgreSQL</Badge>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
