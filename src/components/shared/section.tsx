import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Section({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-20 sm:py-28 lg:py-32", className)} {...props} />
  );
}
