import { DatabaseZap } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmptyState({
  title = "Nothing published here yet.",
  description = "This section is being prepared. Please explore the rest of the portfolio in the meantime.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="py-12 sm:py-16">
        <span className="grid size-11 place-items-center rounded-[var(--radius-control)] bg-[var(--surface-raised)] text-[var(--accent)]">
          <DatabaseZap aria-hidden size={20} />
        </span>
        <CardTitle className="pt-6">{title}</CardTitle>
        <CardDescription className="max-w-xl">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
