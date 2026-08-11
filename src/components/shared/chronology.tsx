import { Building2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type ChronologyItem = {
  id: string;
  period?: string | undefined;
  title: string;
  organization: string;
  location?: string | null | undefined;
  summary?: React.ReactNode | undefined;
  highlights?: readonly string[] | undefined;
  technologies?: readonly string[] | undefined;
  current?: boolean | undefined;
};

export function Chronology({
  className,
  compact = false,
  items,
}: {
  className?: string;
  compact?: boolean;
  items: readonly ChronologyItem[];
}) {
  const Heading = compact ? "h3" : "h2";

  return (
    <ol
      className={cn(
        "chronology relative before:absolute before:top-3 before:bottom-3 before:left-[0.4375rem] before:w-px before:bg-[var(--border-strong)]",
        compact ? "space-y-4" : "space-y-6",
        className,
      )}
    >
      {items.map((item, index) => (
        <li className="group relative pl-9 sm:pl-12" key={item.id}>
          <span
            aria-hidden
            className={cn(
              "absolute top-7 left-0 grid size-3.5 place-items-center rounded-full border-2 border-[var(--background)] bg-[var(--surface-raised)] ring-1 ring-[var(--border-strong)] transition-colors group-hover:bg-[var(--accent)] group-hover:ring-[var(--accent)]",
              item.current && "bg-[var(--accent)] ring-[var(--accent)]",
            )}
          />
          <article
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-[border-color,transform] hover:border-[var(--border-strong)]",
              compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
            )}
          >
            <span className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.18em] text-[var(--muted)] uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-wrap items-center gap-2 pr-10">
              {item.current ? <Badge>Current</Badge> : null}
              {item.period ? (
                <Badge variant="neutral">{item.period}</Badge>
              ) : null}
            </div>
            <div
              className={cn(
                "grid gap-5",
                compact
                  ? "mt-5"
                  : "mt-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10",
              )}
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent)]">
                    <Building2 aria-hidden size={17} />
                  </span>
                  <div>
                    <Heading
                      className={cn(
                        "font-semibold tracking-tight",
                        compact ? "text-xl" : "text-2xl",
                      )}
                    >
                      {item.title}
                    </Heading>
                    <p className="mt-1 text-sm font-medium text-[var(--accent)]">
                      {item.organization}
                    </p>
                  </div>
                </div>
                {item.location ? (
                  <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]">
                    <MapPin className="mt-0.5 shrink-0" aria-hidden size={13} />
                    {item.location}
                  </p>
                ) : null}
              </div>
              <div>
                {item.summary ? (
                  <div className="leading-7 text-[var(--muted)]">
                    {item.summary}
                  </div>
                ) : null}
                {!compact && item.highlights?.length ? (
                  <ul className="mt-6 grid gap-3 text-sm leading-6 text-[var(--muted)] md:grid-cols-2">
                    {item.highlights.map((highlight) => (
                      <li
                        className="relative border-l border-[var(--border-strong)] pl-4"
                        key={highlight}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {item.technologies?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.technologies.map((technology) => (
                      <Badge key={technology} variant="neutral">
                        {technology}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
