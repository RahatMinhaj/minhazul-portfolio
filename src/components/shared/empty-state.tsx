import { DatabaseZap } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmptyState({
  title = "Verified content has not been added yet.",
  description = "This section will populate from the database after the owner’s CV is reviewed. No temporary professional records are shown.",
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
