import { BookOpen, Building2, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type EducationRecord = {
  id: string;
  institution: string;
  degree: string;
  field?: string | null | undefined;
  period?: string | undefined;
  description?: React.ReactNode | undefined;
};

export function EducationRecords({
  compact = false,
  headingLevel = 2,
  records,
}: {
  compact?: boolean;
  headingLevel?: 2 | 3;
  records: readonly EducationRecord[];
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ol className="education-path relative space-y-4">
      {records.map((record, index) => (
        <li
          className="group relative grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6"
          key={record.id}
        >
          <div className="relative hidden pt-6 text-right sm:block">
            <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--muted)] uppercase">
              {record.period ?? `Program ${String(index + 1).padStart(2, "0")}`}
            </p>
            <span
              aria-hidden
              className="absolute top-7 -right-[1.7rem] z-10 size-2.5 rounded-full border-2 border-[var(--background)] bg-[var(--surface-raised)] ring-1 ring-[var(--border-strong)] transition-colors group-hover:bg-[var(--accent)] group-hover:ring-[var(--accent)]"
            />
          </div>

          <article
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-[border-color,transform] hover:border-[var(--border-strong)]",
              compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
            )}
          >
            <div
              className="education-record-grid absolute inset-0"
              aria-hidden
            />
            <div className="relative flex items-start gap-4 sm:gap-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--accent)] sm:size-12">
                <GraduationCap aria-hidden size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[var(--accent)] uppercase">
                    <Building2 aria-hidden size={12} />
                    {record.institution}
                  </span>
                  {record.period ? (
                    <Badge className="sm:hidden" variant="neutral">
                      {record.period}
                    </Badge>
                  ) : null}
                </div>
                <Heading
                  className={cn(
                    "mt-3 max-w-3xl font-semibold tracking-tight",
                    compact ? "text-xl" : "text-2xl sm:text-3xl",
                  )}
                >
                  {record.degree}
                </Heading>
                {record.field ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                    <BookOpen aria-hidden size={14} />
                    {record.field}
                  </p>
                ) : null}
              </div>
            </div>
            {!compact && record.description ? (
              <div className="relative mt-7 border-t border-[var(--border)] pt-6 text-sm leading-7 text-[var(--muted)]">
                {record.description}
              </div>
            ) : null}
          </article>
        </li>
      ))}
    </ol>
  );
}
