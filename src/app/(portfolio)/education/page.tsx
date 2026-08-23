import type { Metadata } from "next";

import {
  EducationRecords,
  type EducationRecord,
} from "@/components/education/education-records";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { RichTextDocument } from "@/components/shared/rich-text-document";
import { formatMonthYear } from "@/lib/utils/date";
import { getVisibleEducation } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Education",
  description: "Academic background and fields of study.",
};

export default async function EducationPage() {
  const education = await getVisibleEducation();
  const records: EducationRecord[] = education.map((item) => ({
    id: item.id,
    institution: item.institution,
    college: item.college,
    logo: item.logo,
    degree: item.degree,
    field: item.field,
    modules: item.modules,
    period: item.startDate
      ? `${formatMonthYear(item.startDate)} - ${item.endDate ? formatMonthYear(item.endDate) : "Present"}`
      : undefined,
    description: item.description ? (
      <RichTextDocument document={item.description} />
    ) : undefined,
  }));

  return (
    <main id="main-content">
      <PageHero
        description="An academic path shaped around enterprise software, information technology, architecture, security, and applied engineering."
        eyebrow="Background / Education"
        status={`${education.length} programs`}
        title="Knowledge built for practice."
      />
      <Container className="py-16 sm:py-24">
        {records.length ? (
          <EducationRecords records={records} />
        ) : (
          <EmptyState />
        )}
      </Container>
    </main>
  );
}
