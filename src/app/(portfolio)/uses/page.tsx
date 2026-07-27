import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVisibleUseItems } from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Uses",
  description: "Verified workstation, software, and engineering tools.",
};

export default async function UsesPage() {
  const items = await getVisibleUseItems();
  const categories = Map.groupBy(items, (item) => item.category);

  return (
    <main id="main-content">
      <PageHero
        description="The hardware, software, frameworks, cloud services, and AI tools used in day-to-day engineering."
        eyebrow="Setup / Uses"
        status={`${items.length} tools`}
        title="A working environment, documented."
      />
      <Container className="py-16 sm:py-24">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {[...categories.entries()].map(([category, categoryItems]) => (
              <section key={category}>
                <h2 className="mb-5 text-2xl font-semibold">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        {item.description ? (
                          <CardDescription>{item.description}</CardDescription>
                        ) : null}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
