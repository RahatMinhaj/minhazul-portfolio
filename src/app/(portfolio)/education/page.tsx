import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { Container } from "@/components/shared/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMonthYear } from "@/lib/utils/date";
import { getVisibleEducation } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Education",
  description: "Verified academic background and fields of study.",
};

export default async function EducationPage() {
  const education = await getVisibleEducation();

  return (
    <main id="main-content">
      <PageHero
        description="Academic records are presented as structured history, with no inferred institutions, grades, or dates."
        eyebrow="Background / Education"
        status={`${education.length} entries`}
        title="Formal foundations."
      />
      <Container className="py-16 sm:py-24">
        {education.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {education.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardDescription>
                    {formatMonthYear(item.startDate)} —{" "}
                    {formatMonthYear(item.endDate)}
                  </CardDescription>
                  <CardTitle>{item.degree}</CardTitle>
                  <p className="text-[var(--muted)]">
                    {item.institution}
                    {item.field ? ` · ${item.field}` : ""}
                  </p>
                </CardHeader>
                {item.description ? (
                  <CardContent>
                    <RichTextDocument document={item.description} />
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
